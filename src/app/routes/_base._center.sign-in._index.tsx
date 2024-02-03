import { Button } from "@radix-ui/themes";
import { css } from "../../../styled-system/css/css.js";
import { trpc } from "../trpc.js";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { createDiscordOauthUrl } from "../discord-oauth.server.js";
import {
	Link,
	useLoaderData,
	useNavigate,
	useRevalidator,
} from "@remix-run/react";
import { assertNoSession } from "../session.server.js";
import { startAuthentication } from "@simplewebauthn/browser";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await assertNoSession(request);

	const { url, setCookie } = createDiscordOauthUrl();

	return json(
		{ discordOauthUrl: url },
		{ headers: [["Set-Cookie", setCookie]] },
	);
};

export default function SignIn() {
	const data = useLoaderData<typeof loader>();
	const { mutateAsync: initializePasskeyAuthentication } =
		trpc.authentication.passkey.authentication.initialize.useMutation();
	const { mutateAsync: verifyPasskeyAuthentication } =
		trpc.authentication.passkey.authentication.verify.useMutation();
	const navigate = useNavigate();

	const revalidator = useRevalidator();

	return (
		<div
			className={css({
				display: "grid",
				alignContent: "start",
				justifyContent: "center",
				gap: "8px",
			})}
		>
			<Button
				onClick={() => {
					initializePasskeyAuthentication()
						.then((options) => {
							return startAuthentication(options);
						})
						.then((response) => {
							return verifyPasskeyAuthentication(response);
						})
						.then(() => {
							revalidator.revalidate();
							navigate("/");
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
		</div>
	);
}
