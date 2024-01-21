import { prisma } from "../../shared/prisma";
import { authenticatedProcedure, router } from "../trpc";
import { emailAuthenticationRouter } from "./authentication/email";

export const authenticationRouter = router({
	email: emailAuthenticationRouter,
	signOut: authenticatedProcedure.mutation(async ({ ctx }) => {
		await prisma.userSession.delete({
			where: {
				token: ctx.sessionToken,
			},
		});
	}),
});
