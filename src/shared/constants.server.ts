import { env } from "./env.server";

export const SESSION_COOKIE_NAME = "app_sesssion_token";

export const SESSION_TOKEN_DURATION = 14 * 24 * 60 * 60 * 1000;

export const ACTIVITY_COOKIE_NAME = "has_recent_activity";

export const DISCORD_OAUTH_STATE_COOKIE_NAME = "discord_oauth_state";

export const DISCORD_OAUTH_CALLBACK_URL = new URL(
	"/callback-discord",
	env.SERVER_ORIGIN,
).href;

export const DISCORD_API = "https://discord.com/api/v10";

export const VERIFY_TOKEN_DURATION = 3 * 60 * 1000;

export const SIGN_IN_REDIRECT_COOKIE_NAME = "sign_in_redirect";
