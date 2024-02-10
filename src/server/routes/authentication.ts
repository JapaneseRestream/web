import { prisma } from "../../shared/prisma.server";
import { authenticatedProcedure, publicProcedure, router } from "../trpc";

import { discordAuthenticationRouter } from "./authentication/discord";
import { passkeyRouter } from "./authentication/passkey";

export const authenticationRouter = router({
	discord: discordAuthenticationRouter,
	passkey: passkeyRouter,

	roles: publicProcedure.query(async ({ ctx }) => {
		if (typeof ctx.user === "undefined") {
			return [];
		}

		const roles = await prisma.userRole.findMany({
			where: {
				userId: ctx.user.id,
			},
			select: {
				role: true,
			},
		});

		return roles.map((role) => role.role);
	}),

	isSignedIn: publicProcedure.query(({ ctx }) => {
		return typeof ctx.user !== "undefined";
	}),

	signOut: authenticatedProcedure.mutation(async ({ ctx }) => {
		await prisma.userSession.delete({
			where: {
				token: ctx.sessionToken,
			},
		});
	}),
});
