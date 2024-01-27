import { TRPCError, initTRPC } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import {
	DISCORD_OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "../shared/constants.server.js";
import { validateSession } from "../shared/session.server.js";
import { sessionCookieOptions } from "../shared/cookie.js";
import { prisma } from "../shared/prisma.server.js";
import { Role } from "@prisma/client";

export const createContext = async ({
	req,
	res,
}: CreateFastifyContextOptions) => {
	const setSessionToken = (token: string) => {
		res.setCookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);
	};

	const discordOauthState = req.cookies[DISCORD_OAUTH_STATE_COOKIE_NAME];

	const signedSessionToken = req.cookies[SESSION_COOKIE_NAME];
	const unsignedToken =
		typeof signedSessionToken === "string"
			? req.unsignCookie(signedSessionToken)
			: undefined;

	if (!unsignedToken?.valid || !unsignedToken.value) {
		return {
			setSessionToken,
			discordOauthState,
		};
	}

	return {
		setSessionToken,
		discordOauthState,
		sessionToken: unsignedToken.value,
	};
};

const t = initTRPC.context<typeof createContext>().create();

export const router = t.router;

export const publicProcedure = t.procedure.use(async ({ ctx, next }) => {
	const session = ctx.sessionToken
		? await validateSession(ctx.sessionToken)
		: undefined;

	return next({
		ctx: {
			user: session?.user,
		},
	});
});

export const authenticatedProcedure = publicProcedure.use(
	async ({ ctx, next }) => {
		if (!ctx.sessionToken || !ctx.user) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}
		return next({
			ctx: {
				sessionToken: ctx.sessionToken,
				user: ctx.user,
			},
		});
	},
);

export const adminProcedure = authenticatedProcedure.use(
	async ({ ctx, next }) => {
		const role = await prisma.userRole.findFirst({
			where: {
				userId: ctx.user.id,
				role: Role.Admin,
			},
		});
		if (!role) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}
		return next();
	},
);
