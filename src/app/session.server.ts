import { redirect } from "@remix-run/node";
import { getSession } from "./cookie.server";
import { serialize } from "cookie";
import { SIGN_IN_REDIRECT_COOKIE_NAME } from "../shared/constants";

export const assertSession = async (request: Request) => {
	const session = await getSession(request);
	if (!session) {
		const url = new URL(request.url);
		throw redirect("/sign-in", {
			headers: [
				["Set-Cookie", serialize(SIGN_IN_REDIRECT_COOKIE_NAME, url.pathname)],
			],
		});
	}
	return session;
};

export const assertNoSession = async (request: Request) => {
	const session = await getSession(request);
	if (session) {
		throw redirect("/");
	}
};
