import { Button, TextField } from "@radix-ui/themes";
import { css } from "../../../styled-system/css/css.js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { trpc } from "../trpc.js";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { createDiscordOauthUrl } from "../discord-oauth.server.js";
import { useLoaderData, useNavigate, useRevalidator } from "@remix-run/react";
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

const EmailSignIn = () => {
	const [sent, setSent] = useState(false);
	const { register, handleSubmit } = useForm<{ email: string }>();
	const { mutate: initialize } =
		trpc.authentication.email.initialize.useMutation({
			onSuccess: () => {
				setSent(true);
			},
			onError: () => {
				// TODO: handle error
			},
		});

	if (sent) {
		return <div>確認メールを送信しました</div>;
	}

	return (
		<form
			onSubmit={handleSubmit((data) => {
				initialize(data);
			})}
			className={css({
				display: "grid",
				gridAutoFlow: "column",
				alignItems: "end",
				gap: "4px",
			})}
		>
			<label className={css({ width: "250px" })}>
				メールアドレス
				<TextField.Input
					type="email"
					inputMode="email"
					autoComplete="email"
					{...register("email")}
				/>
			</label>
			<Button type="submit">ログイン</Button>
		</form>
	);
};

export default function SignIn() {
	const [useEmail, setUseEmail] = useState(false);
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
			{useEmail ? (
				<EmailSignIn />
			) : (
				<>
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
					<Button
						onClick={() => {
							setUseEmail(true);
						}}
					>
						Eメールでログイン
					</Button>
				</>
			)}
		</div>
	);
}
