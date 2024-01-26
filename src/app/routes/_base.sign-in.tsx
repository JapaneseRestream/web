import { Button, TextField } from "@radix-ui/themes";
import { css } from "../../../styled-system/css/css.js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { trpc } from "../trpc.js";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { createDiscordOauthUrl } from "../discord-oauth.server.js";
import { useLoaderData } from "@remix-run/react";

export const loader = (_: LoaderFunctionArgs) => {
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
					<Button disabled>パスキーでログイン</Button>
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
