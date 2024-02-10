import { Button, Text, TextField } from "@radix-ui/themes";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { css } from "../../../styled-system/css";
import { createToken } from "../../shared/create-token";
import { sendEmail } from "../../shared/email.server";
import { env } from "../../shared/env.server";
import { prisma } from "../../shared/prisma.server";
import { CenterLayout } from "../components/center-layout";
import { assertNoSession } from "../session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await assertNoSession(request);
	return null;
};

export default () => {
	const data = useActionData<typeof action>();

	if (typeof data !== "undefined") {
		return (
			<CenterLayout>
				<Text>
					メールを送信しました。メールに記載されたリンクをクリックしてください。
				</Text>
			</CenterLayout>
		);
	}

	return (
		<CenterLayout className={css({ justifyItems: "center", gap: "8px" })}>
			<Text asChild size="5" weight="bold">
				<h1>Eメールでログイン</h1>
			</Text>
			<Form
				method="post"
				className={css({
					display: "grid",
					justifyItems: "end",
					gap: "4px",
				})}
			>
				<label className={css({ width: "250px" })}>
					<Text>メールアドレス</Text>
					<TextField.Input
						type="email"
						name="email"
						inputMode="email"
						autoComplete="email"
						required
					/>
				</label>
				<Button type="submit">ログイン</Button>
			</Form>
		</CenterLayout>
	);
};

export const ErrorBoundary = () => {
	return <Text color="red">エラーが発生しました</Text>;
};

const schema = zfd.formData({
	email: zfd.text(z.string().email()),
});

export const action = async ({ request }: ActionFunctionArgs) => {
	const { email } = schema.parse(await request.formData());
	const user = await prisma.user.findUnique({
		where: {
			email: email,
		},
		select: {
			id: true,
		},
	});
	if (!user) {
		await sendEmail({
			to: email,
			subject: "japanese-restream.org: ログイン",
			body: "このEメールアドレスはユーザー登録されていません",
		});
		return null;
	}

	const token = createToken();

	await prisma.emailAuthentication.upsert({
		where: {
			userId: user.id,
		},
		create: {
			userId: user.id,
			token,
		},
		update: {
			token,
		},
	});

	const url = new URL("/verify-email-authentication", env.SERVER_ORIGIN);
	url.searchParams.set("token", token);

	await sendEmail({
		to: email,
		subject: "japanese-restream.org: ログイン",
		body:
			"Japanese Restreamのウェブサイトにログインするには、以下のリンクをクリックしてください。このメールに心当たりがない場合は、このメールを無視してください。" +
			"\n\n" +
			url.href,
	});

	return null;
};
