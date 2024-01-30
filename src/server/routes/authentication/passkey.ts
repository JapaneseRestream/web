import {
	generateRegistrationOptions,
	verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/types";
import { authenticatedProcedure, router } from "../../trpc";
import { env } from "../../../shared/env.server";
import { prisma } from "../../../shared/prisma.server";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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
});

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
			});
			if (!verification.verified || !verification.registrationInfo) {
				throw new TRPCError({ code: "BAD_REQUEST" });
			}
			console.log(verification.registrationInfo.aaguid);
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

const passkeyAuthenticationRouter = router({});

export const passkeyRouter = router({
	registration: passkeyRegisterationRouter,
	authentication: passkeyAuthenticationRouter,
});
