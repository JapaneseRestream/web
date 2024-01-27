import { SESSION_TOKEN_DURATION } from "./constants.server.js";
import { env } from "./env.server.js";

export const sessionCookieOptions = {
	httpOnly: true,
	sameSite: "strict",
	maxAge: SESSION_TOKEN_DURATION / 1000,
	path: "/",
	secure: env.NODE_ENV === "production",
	signed: true,
} as const;

export const activityCookieOptions = {
	httpOnly: true,
	sameSite: "strict",
	maxAge: 60 * 60, // 1 hour
	path: "/",
	secure: env.NODE_ENV === "production",
} as const;
