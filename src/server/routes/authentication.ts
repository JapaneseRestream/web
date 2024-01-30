import { prisma } from "../../shared/prisma.server";
import { authenticatedProcedure, router } from "../trpc";
import { discordAuthenticationRouter } from "./authentication/discord";
import { emailAuthenticationRouter } from "./authentication/email";
import { passkeyRouter } from "./authentication/passkey";

export const authenticationRouter = router({
	email: emailAuthenticationRouter,
	discord: discordAuthenticationRouter,
	passkey: passkeyRouter,

	signOut: authenticatedProcedure.mutation(async ({ ctx }) => {
		await prisma.userSession.delete({
			where: {
				token: ctx.sessionToken,
			},
		});
	}),
});
