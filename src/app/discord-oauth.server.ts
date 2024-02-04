import cookie from "cookie";

import {
	DISCORD_OAUTH_CALLBACK_PATH,
	DISCORD_OAUTH_STATE_COOKIE_NAME,
} from "../shared/constants";
import { createToken } from "../shared/create-token";
import { env } from "../shared/env.server";

const discordOauthUrl = "https://discord.com/oauth2/authorize";

export const createDiscordOauthUrl = () => {
	const state = createToken();
	const url = new URL(discordOauthUrl);
	url.searchParams.set("response_type", "code");
	url.searchParams.set("client_id", env.DISCORD_CLIENT_ID);
	url.searchParams.set("scope", "identify");
	url.searchParams.set("state", state);
	url.searchParams.set(
		"redirect_uri",
		new URL(DISCORD_OAUTH_CALLBACK_PATH, env.SERVER_ORIGIN).href,
	);

	const stateSetCookie = cookie.serialize(
		DISCORD_OAUTH_STATE_COOKIE_NAME,
		state,
		{
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			sameSite: "strict",
			path: "/",
			maxAge: 10 * 60, // 10 minutes
		},
	);

	return {
		url: url.href,
		setCookie: stateSetCookie,
	};
};
