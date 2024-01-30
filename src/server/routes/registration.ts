import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";
import { createToken } from "../../shared/create-token.js";
import { prisma } from "../../shared/prisma.server.js";
import { env } from "../../shared/env.server.js";
import { TRPCError } from "@trpc/server";
import { createSession } from "../../shared/session.server.js";
import { VERIFY_TOKEN_DURATION } from "../../shared/constants.server.js";
import { sendEmail } from "../email.js";

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
				await sendEmail({
					to: input.email,
					subject: "japanese-restream.org: 新規登録",
					body: "このEメールアドレスは既にユーザー登録されています",
				});
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

			await sendEmail({
				to: input.email,
				subject: "japanese-restream.org: 新規登録",
				body: [
					"このメールは、japanese-restream.org にて新規登録を行ったことを確認するために送信されています。以下のリンクをクリックして新規登録を完了してください。",
					url.href,
					"もし、japanese-restream.org にて新規登録を行っていない場合は、このメールを破棄してください。",
				].join("\n\n"),
			});
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
						gt: new Date(Date.now() - VERIFY_TOKEN_DURATION),
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
