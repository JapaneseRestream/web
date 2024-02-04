import {
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
	AuthenticatorTransportFuture,
	RegistrationResponseJSON,
	AuthenticationResponseJSON,
} from "@simplewebauthn/types";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { env } from "../../../shared/env.server";
import { prisma } from "../../../shared/prisma.server";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createToken } from "../../../shared/create-token";
import { PASSKEY_CHALLENGE_COOKIE_NAME } from "../../../shared/constants";

const verifyRegistrationResponseSchema = z.object({
	id: z.string(),
	rawId: z.string(),
	response: z.object({
		clientDataJSON: z.string(),
		attestationObject: z.string(),
		authenticatorData: z.string().optional(),
		transports: z
			.array(
				z.enum([
					"ble",
					"cable",
					"hybrid",
					"internal",
					"nfc",
					"smart-card",
					"usb",
				]),
			)
			.optional(),
		publicKeyAlgorithm: z.number().optional(),
		publicKey: z.string().optional(),
	}),
	authenticatorAttachment: z.enum(["platform", "cross-platform"]).optional(),
	clientExtensionResults: z.object({
		appid: z.boolean().optional(),
		credProps: z.object({ rk: z.boolean().optional() }).optional(),
		hmacCreateSecret: z.boolean().optional(),
	}),
	type: z.enum(["public-key"]),
}) satisfies z.ZodType<RegistrationResponseJSON>;

const verifyAuthenticationResponseSchema = z.object({
	id: z.string(),
	rawId: z.string(),
	response: z.object({
		clientDataJSON: z.string(),
		authenticatorData: z.string(),
		signature: z.string(),
		userHandle: z.string().optional(),
	}),
	authenticatorAttachment: z.enum(["platform", "cross-platform"]).optional(),
	clientExtensionResults: z.object({
		appid: z.boolean().optional(),
		credProps: z.object({ rk: z.boolean().optional() }).optional(),
		hmacCreateSecret: z.boolean().optional(),
	}),
	type: z.enum(["public-key"]),
}) satisfies z.ZodType<AuthenticationResponseJSON>;

const passkeyRegisterationRouter = router({
	initialize: authenticatedProcedure.mutation(async ({ ctx }) => {
		const existingAuthenticators =
			await prisma.userPasskeyAuthenticator.findMany({
				where: { userId: ctx.user.id },
				select: {
					credentialId: true,
					transports: true,
				},
			});
		const options = await generateRegistrationOptions({
			rpID: env.PASSKEY_RP_ID,
			rpName: env.PASSKEY_RP_NAME,
			userID: ctx.user.id,
			userName: ctx.user.email,
			attestationType: "none",
			excludeCredentials: existingAuthenticators.map((authenticator) => ({
				id: authenticator.credentialId,
				type: "public-key",
				transports: authenticator.transports as AuthenticatorTransportFuture[],
			})),
			authenticatorSelection: {
				residentKey: "required",
				userVerification: "preferred",
			},
		});
		await prisma.userPasskeyChallenge.upsert({
			where: { userId: ctx.user.id },
			create: {
				userId: ctx.user.id,
				challenge: options.challenge,
			},
			update: {
				challenge: options.challenge,
			},
		});
		return options;
	}),

	verify: authenticatedProcedure
		.input(verifyRegistrationResponseSchema)
		.mutation(async ({ ctx, input }) => {
			const expectedChallenge = await prisma.userPasskeyChallenge.findUnique({
				where: { userId: ctx.user.id },
			});
			if (!expectedChallenge) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			const verification = await verifyRegistrationResponse({
				response: input,
				expectedChallenge: expectedChallenge.challenge,
				expectedOrigin: env.SERVER_ORIGIN,
				expectedRPID: env.PASSKEY_RP_ID,
				requireUserVerification: true,
			});
			if (!verification.verified || !verification.registrationInfo) {
				throw new TRPCError({ code: "BAD_REQUEST" });
			}
			await prisma.userPasskeyAuthenticator.create({
				data: {
					userId: ctx.user.id,
					credentialId: Buffer.from(
						verification.registrationInfo.credentialID.buffer,
					),
					credentialPublicKey: Buffer.from(
						verification.registrationInfo.credentialPublicKey.buffer,
					),
					counter: verification.registrationInfo.counter,
					credentialDeviceType:
						verification.registrationInfo.credentialDeviceType,
					credentialBackedUp: verification.registrationInfo.credentialBackedUp,
					transports: input.response.transports,
					aaguid: verification.registrationInfo.aaguid,
				},
			});
		}),
});

const passkeyAuthenticationRouter = router({
	verify: publicProcedure
		.input(verifyAuthenticationResponseSchema)
		.mutation(async ({ ctx, input }) => {
			const expectedChallenge = ctx.readSignedCookie(
				PASSKEY_CHALLENGE_COOKIE_NAME,
			);
			if (!expectedChallenge) {
				throw new TRPCError({ code: "BAD_REQUEST", message: "no challenge" });
			}
			const authenticator = await prisma.userPasskeyAuthenticator.findUnique({
				where: { credentialId: Buffer.from(input.id, "base64url") },
				select: {
					id: true,
					credentialId: true,
					credentialPublicKey: true,
					counter: true,
					transports: true,
					user: {
						select: {
							id: true,
						},
					},
				},
			});
			if (!authenticator) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "authenticator not found",
				});
			}
			const verification = await verifyAuthenticationResponse({
				response: input,
				expectedChallenge,
				expectedOrigin: env.SERVER_ORIGIN,
				expectedRPID: env.PASSKEY_RP_ID,
				authenticator: {
					credentialID: authenticator.credentialId,
					credentialPublicKey: authenticator.credentialPublicKey,
					counter: Number(authenticator.counter),
					transports:
						authenticator.transports as AuthenticatorTransportFuture[],
				},
				requireUserVerification: true,
			});
			if (!verification.verified) {
				throw new TRPCError({ code: "BAD_REQUEST", message: "not verified" });
			}
			const newCounter = verification.authenticationInfo.newCounter;
			const sessionToken = createToken();
			await prisma.$transaction(async (tx) => {
				await Promise.all([
					tx.userPasskeyAuthenticator.update({
						where: { id: authenticator.id },
						data: {
							counter: newCounter,
							lastUsedAt: new Date(),
						},
					}),
					tx.userSession.create({
						data: {
							userId: authenticator.user.id,
							token: sessionToken,
						},
					}),
				]);
			});
			ctx.setSessionToken(sessionToken);
		}),
});

export const passkeyRouter = router({
	registration: passkeyRegisterationRouter,
	authentication: passkeyAuthenticationRouter,
	delete: authenticatedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			await prisma.userPasskeyAuthenticator.delete({
				where: {
					id: input.id,
					userId: ctx.user.id,
				},
			});
		}),
});
