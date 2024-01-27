import { z } from "zod";
import { publicProcedure, router } from "../../trpc";
import { prisma } from "../../../shared/prisma.server";
import { createToken } from "../../../shared/create-token";
import { env } from "../../../shared/env.server";
import { TRPCError } from "@trpc/server";
import { createSession } from "../../../shared/session.server";
import { VERIFY_TOKEN_DURATION } from "../../../shared/constants.server";

export const emailAuthenticationRouter = router({
	initialize: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
			}),
		)
		.mutation(async ({ input }) => {
			const user = await prisma.user.findUnique({
				where: {
					email: input.email,
				},
				select: {
					id: true,
				},
			});
			if (!user) {
				console.log("user with the email does not exist");
				return;
			}

			const token = createToken();

			await prisma.emailAuthentication.upsert({
				where: {
					userId: user.id,
				},
				create: {
					userId: user.id,
					token,
				},
				update: {
					token,
				},
			});

			const url = new URL("/verify-email-authentication", env.SERVER_ORIGIN);
			url.searchParams.set("token", token);

			console.log(url.href);
		}),

	verify: publicProcedure
		.input(
			z.object({
				token: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const emailAuthentication = await prisma.emailAuthentication.findUnique({
				where: {
					token: input.token,
					updatedAt: {
						gt: new Date(Date.now() - VERIFY_TOKEN_DURATION),
					},
				},
				select: {
					userId: true,
				},
			});
			if (!emailAuthentication) {
				throw new TRPCError({ code: "BAD_REQUEST", message: "invalid token" });
			}
			await prisma.emailAuthentication.delete({
				where: {
					token: input.token,
				},
			});

			const token = await createSession({
				newUser: false,
				userId: emailAuthentication.userId,
			});

			ctx.setSessionToken(token);
		}),
});
