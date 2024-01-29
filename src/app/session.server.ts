import { redirect } from "@remix-run/react";
import { getSession } from "./cookie.server";

export const assertSession = async (request: Request) => {
	const session = await getSession(request);
	if (!session) {
		throw redirect("/sign-in");
	}
	return session;
};

export const assertNoSession = async (request: Request) => {
	const session = await getSession(request);
	if (session) {
		throw redirect("/");
	}
};
