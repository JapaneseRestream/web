import { Button } from "@radix-ui/themes";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
	Link,
	useLoaderData,
	useNavigate,
	useRevalidator,
} from "@remix-run/react";
import { startAuthentication } from "@simplewebauthn/browser";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { parse } from "cookie";

import { css } from "../../../styled-system/css/css.js";
import {
	PASSKEY_CHALLENGE_COOKIE_NAME,
	SIGN_IN_REDIRECT_COOKIE_NAME,
} from "../../shared/constants.js";
import { env } from "../../shared/env.server.js";
import { CenterLayout } from "../components/center-layout.js";
import { serializeCookie } from "../cookie.server.js";
import { createDiscordOauthUrl } from "../discord-oauth.server.js";
import { assertNoSession } from "../session.server.js";
import { trpc } from "../trpc.js";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await assertNoSession(request);

	const { url: discordOauthUrl, setCookie: discordOauthStateCookie } =
		createDiscordOauthUrl();

	const passkeyOptions = await generateAuthenticationOptions({
		rpID: env.PASSKEY_RP_ID,
		userVerification: "preferred",
	});

	return json(
		{ discordOauthUrl, passkeyOptions },
		{
			headers: [
				["Set-Cookie", discordOauthStateCookie],
				[
					"Set-Cookie",
					serializeCookie(
						PASSKEY_CHALLENGE_COOKIE_NAME,
						passkeyOptions.challenge,
					),
				],
			],
		},
	);
};

export default function SignIn() {
	const data = useLoaderData<typeof loader>();
	const { mutateAsync: verifyPasskeyAuthentication } =
		trpc.authentication.passkey.authentication.verify.useMutation();
	const navigate = useNavigate();

	const revalidator = useRevalidator();

	return (
		<CenterLayout className={css({ gap: "8px" })}>
			<Button
				onClick={() => {
					startAuthentication(data.passkeyOptions)
						.then((response) => {
							return verifyPasskeyAuthentication(response);
						})
						.then(() => {
							revalidator.revalidate();
							const redirectUrl = parse(document.cookie)[
								SIGN_IN_REDIRECT_COOKIE_NAME
							];
							navigate(redirectUrl ?? "/");
						})
						.catch((error) => {
							console.error(error);
							alert("エラーが発生しました");
						});
				}}
			>
				パスキーでログイン
			</Button>
			<Button asChild>
				<a href={data.discordOauthUrl}>Discordでログイン</a>
			</Button>
			<Button asChild>
				<Link to="email">Eメールでログイン</Link>
			</Button>
		</CenterLayout>
	);
}
