import { Button, TextField } from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import { trpc } from "../trpc.js";
import { useState } from "react";
import { css } from "../../styled-system/css/css.js";

export default function Register() {
	const [sent, setSent] = useState(false);
	const { register, handleSubmit } = useForm<{ email: string }>();
	const { mutate: initialize } = trpc.registration.initialize.useMutation({
		onSuccess: () => {
			setSent(true);
		},
		onError: () => {
			// TODO: handle error
		},
	});

	return (
		<div
			className={css({
				display: "grid",
				alignContent: "start",
				justifyContent: "center",
				justifyItems: "center",
			})}
		>
			{sent ? (
				<div>確認メールを送信しました</div>
			) : (
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
							inputMode="email"
							type="email"
							autoComplete="email"
							{...register("email")}
						/>
					</label>
					<Button type="submit">登録</Button>
				</form>
			)}
		</div>
	);
}
