import { z } from "zod";
import { publicProcedure, router } from "../../trpc";
import { env } from "../../../shared/env";
import { DISCORD_OAUTH_CALLBACK_URL } from "../../../shared/constants.server";
import ky from "ky";
import { TRPCError } from "@trpc/server";
import { Routes } from "discord.js";
import { apiUrl } from "../../discord-api";
import { prisma } from "../../../../shared/prisma.server";
import { createSession } from "../../../shared/session";

export const discordAuthenticationRouter = router({
	verify: publicProcedure
		.input(
			z.object({
				code: z.string(),
				state: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const cookieState = ctx.discordOauthState;
			if (cookieState !== input.state) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "mismatched state",
				});
			}

			const form = new URLSearchParams({
				client_id: env.DISCORD_CLIENT_ID,
				client_secret: env.DISCORD_CLIENT_SECRET,
				grant_type: "authorization_code",
				code: input.code,
				redirect_uri: DISCORD_OAUTH_CALLBACK_URL,
				scope: "identify",
			});
			const data = await ky
				.post("https://discord.com/api/oauth2/token", {
					body: form.toString(),
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
				})
				.json<{
					access_token: string;
					token_type: string;
					expires_in: number;
					refresh_token: string;
					scope: string;
				}>();

			const discordMe = await ky
				.get(apiUrl(Routes.user("@me")), {
					headers: {
						authorization: `Bearer ${data.access_token}`,
					},
				})
				.json<{
					id: string;
					username: string;
					discriminator: string;
				}>();

			const username =
				discordMe.discriminator === "0"
					? discordMe.username
					: `${discordMe.username}#${discordMe.discriminator}`;

			const sessionUser = ctx.user;
			if (sessionUser) {
				await prisma.userDiscord.upsert({
					where: {
						userId: sessionUser.id,
					},
					create: {
						userId: sessionUser.id,
						discordId: discordMe.id,
						username,
						accessToken: data.access_token,
						refreshToken: data.refresh_token,
					},
					update: {
						discordId: discordMe.id,
						username,
						accessToken: data.access_token,
						refreshToken: data.refresh_token,
					},
				});
			} else {
				const userDiscord = await prisma.userDiscord.findUnique({
					where: {
						discordId: discordMe.id,
					},
					select: {
						id: true,
						user: {
							select: {
								id: true,
							},
						},
					},
				});
				if (!userDiscord) {
					throw new TRPCError({ code: "UNAUTHORIZED" });
				}

				await prisma.userDiscord.update({
					where: {
						id: userDiscord.id,
					},
					data: {
						username,
						accessToken: data.access_token,
						refreshToken: data.refresh_token,
					},
				});

				const token = await createSession({
					newUser: false,
					userId: userDiscord.user.id,
				});
				ctx.setSessionToken(token);
			}
		}),
});
