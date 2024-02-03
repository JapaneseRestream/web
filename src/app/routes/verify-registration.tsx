import { redirect } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "../../shared/prisma.server.js";
import { VERIFY_TOKEN_DURATION } from "../../shared/constants.js";
import { serializeSessionToken } from "../cookie.server.js";
import { createSession } from "../../shared/session.server.js";
import { Text } from "@radix-ui/themes";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const authToken = url.searchParams.get("token");

	if (!authToken) {
		return new Response("token is missing", { status: 400 });
	}

	const registration = await prisma.userRegistration.findUnique({
		where: {
			token: authToken,
			updatedAt: {
				gt: new Date(Date.now() - VERIFY_TOKEN_DURATION),
			},
		},
		select: {
			email: true,
		},
	});
	if (!registration) {
		throw new Response("invalid token", { status: 400 });
	}
	await prisma.userRegistration.delete({
		where: {
			token: authToken,
		},
	});

	const sessionToken = await createSession({
		newUser: true,
		email: registration.email,
	});

	const sessionCookie = serializeSessionToken(sessionToken);

	throw redirect("/", {
		headers: [["Set-Cookie", sessionCookie]],
	});
};

export default () => null;

export const ErrorBoundary = () => {
	return <Text color="red">エラーが発生しました</Text>;
};
