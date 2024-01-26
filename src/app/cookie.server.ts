import cookie from "cookie";
import cookieSignature from "cookie-signature";
import {
	ACTIVITY_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "../shared/constants.server.js";
import { env } from "../shared/env.js";
import {
	activityCookieOptions,
	sessionCookieOptions,
} from "../shared/cookie.js";
import { validateSession } from "../shared/session.js";

export const parseCookie = (request: Request) => {
	const cookieHeader = request.headers.get("cookie");
	if (!cookieHeader) {
		return {};
	}
	return cookie.parse(cookieHeader);
};

export const parseSessionToken = (cookies: Record<string, string>) => {
	const signedSessionToken = cookies[SESSION_COOKIE_NAME];
	if (!signedSessionToken) {
		return;
	}
	const sessionToken = cookieSignature.unsign(
		signedSessionToken,
		env.SESSION_COOKIE_SECRET,
	);
	if (!sessionToken) {
		return;
	}
	return sessionToken;
};

export const getSessionToken = (request: Request) => {
	const cookies = parseCookie(request);
	return parseSessionToken(cookies);
};

export const getSession = async (request: Request) => {
	const token = getSessionToken(request);
	if (!token) {
		return;
	}
	const session = await validateSession(token);
	return session;
};

export const serializeSessionToken = (sessionToken: string) => {
	const signedSessionToken = cookieSignature.sign(
		sessionToken,
		env.SESSION_COOKIE_SECRET,
	);
	return cookie.serialize(
		SESSION_COOKIE_NAME,
		signedSessionToken,
		sessionCookieOptions,
	);
};

export const activityCookieSetCookie = cookie.serialize(
	ACTIVITY_COOKIE_NAME,
	"1",
	activityCookieOptions,
);