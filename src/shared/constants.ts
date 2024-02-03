export const SESSION_COOKIE_NAME = "app_sesssion_token";

export const SESSION_TOKEN_DURATION = 14 * 24 * 60 * 60 * 1000;

export const ACTIVITY_COOKIE_NAME = "has_recent_activity";

export const DISCORD_OAUTH_STATE_COOKIE_NAME = "discord_oauth_state";

export const DISCORD_OAUTH_CALLBACK_PATH = "/callback-discord";

export const DISCORD_API = "https://discord.com/api/v10";

export const VERIFY_TOKEN_DURATION = 3 * 60 * 1000;

export const SIGN_IN_REDIRECT_COOKIE_NAME = "sign_in_redirect";

export const PASSKEY_CHALLENGE_COOKIE_NAME = "passkey_challenge";

export const dataSourceType = ["GDQ", "ESA", "Oengus"] as const;

export type DataSourceType = (typeof dataSourceType)[number];
