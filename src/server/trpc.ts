import { TRPCError, initTRPC } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import {
	DISCORD_OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "../shared/constants.js";
import { validateSession } from "../shared/session.server.js";
import { sessionCookieOptions } from "../shared/cookie.js";
import { prisma } from "../shared/prisma.server.js";
import { Role } from "@prisma/client";
import { env } from "../shared/env.server.js";
import type { CookieSerializeOptions } from "@fastify/cookie";

export const createContext = ({ req, res }: CreateFastifyContextOptions) => {
	const setCookie = (
		name: string,
		value: string,
		options?: CookieSerializeOptions,
	) => {
		void res.setCookie(name, value, {
			httpOnly: true,
			sameSite: "strict",
			path: "/",
			secure: env.NODE_ENV === "production",
			signed: true,
			...options,
		});
	};

	const readSignedCookie = (name: string) => {
		const signed = req.cookies[name];
		if (!signed) {
			return;
		}
		const cookie = req.unsignCookie(signed);
		if (!cookie.valid) {
			return;
		}
		return cookie.value;
	};

	const setSessionToken = (token: string) => {
		setCookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);
	};

	const discordOauthState = req.cookies[DISCORD_OAUTH_STATE_COOKIE_NAME];

	const sessionToken = readSignedCookie(SESSION_COOKIE_NAME);

	if (!sessionToken) {
		return {
			setCookie,
			readSignedCookie,
			setSessionToken,
			discordOauthState,
		};
	}

	return {
		setCookie,
		readSignedCookie,
		setSessionToken,
		discordOauthState,
		sessionToken,
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
