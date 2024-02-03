import { redirect } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "../../shared/prisma.server";
import {
	SIGN_IN_REDIRECT_COOKIE_NAME,
	VERIFY_TOKEN_DURATION,
} from "../../shared/constants.server";
import { createSession } from "../../shared/session.server";
import { parseCookie, serializeSessionToken } from "../cookie.server";
import { Text } from "@radix-ui/themes";
import { serialize } from "cookie";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const authToken = url.searchParams.get("token");

	if (!authToken) {
		throw new Response("token is missing", { status: 400 });
	}

	const emailAuthentication = await prisma.emailAuthentication.findUnique({
		where: {
			token: authToken,
			updatedAt: {
				gt: new Date(Date.now() - VERIFY_TOKEN_DURATION),
			},
		},
		select: {
			userId: true,
		},
	});
	if (!emailAuthentication) {
		throw new Response("invalid token", { status: 400 });
	}
	await prisma.emailAuthentication.delete({
		where: { token: authToken },
	});

	const sessionToken = await createSession({
		newUser: false,
		userId: emailAuthentication.userId,
	});

	const serializedSesssionToken = serializeSessionToken(sessionToken);

	const redirectUrl = parseCookie(request)[SIGN_IN_REDIRECT_COOKIE_NAME];

	throw redirect(redirectUrl ?? "/", {
		headers: [
			["Set-Cookie", serializedSesssionToken],
			[
				"Set-Cookie",
				serialize(SIGN_IN_REDIRECT_COOKIE_NAME, "", {
					expires: new Date(0),
				}),
			],
		],
	});
};

export default () => null;

export const ErrorBoundary = () => {
	return <Text color="red">エラーが発生しました</Text>;
};
