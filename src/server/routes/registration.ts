import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";
import { createToken } from "../../shared/create-token.js";
import { prisma } from "../../../shared/prisma.server.js";
import { env } from "../../shared/env.js";
import { TRPCError } from "@trpc/server";
import { createSession } from "../../shared/session.js";

export const registrationRouter = router({
	initialize: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
			}),
		)
		.mutation(async ({ input }) => {
			const existingUser = await prisma.user.findUnique({
				where: {
					email: input.email,
				},
				select: {
					id: true,
				},
			});
			if (existingUser) {
				console.log("user with the email already exists");
				return;
			}

			const token = createToken();

			await prisma.userRegistration.upsert({
				where: {
					email: input.email,
				},
				create: {
					email: input.email,
					token,
				},
				update: {
					token,
				},
			});

			const url = new URL("/verify-registration", env.SERVER_ORIGIN);
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
			const registration = await prisma.userRegistration.findUnique({
				where: {
					token: input.token,
					updatedAt: {
						gt: new Date(Date.now() - 10 * 60 * 1000),
					},
				},
				select: {
					email: true,
				},
			});
			if (!registration) {
				throw new TRPCError({ code: "BAD_REQUEST", message: "invalid token" });
			}
			await prisma.userRegistration.delete({
				where: {
					token: input.token,
				},
			});

			const token = await createSession({
				newUser: true,
				email: registration.email,
			});

			ctx.setSessionToken(token);
		}),
});
