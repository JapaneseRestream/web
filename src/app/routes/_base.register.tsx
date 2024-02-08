import { Button, Text, TextField } from "@radix-ui/themes";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { css } from "../../../styled-system/css/css.js";
import { sendEmail } from "../../server/email.js";
import { createToken } from "../../shared/create-token.js";
import { env } from "../../shared/env.server.js";
import { prisma } from "../../shared/prisma.server.js";
import { CenterLayout } from "../components/center-layout.js";
import { assertNoSession } from "../session.server.js";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await assertNoSession(request);
	return null;
};

export default () => {
	const data = useActionData<typeof action>();

	if (typeof data !== "undefined") {
		return (
			<CenterLayout>
				<Text>確認メールを送信しました</Text>
			</CenterLayout>
		);
	}

	return (
		<CenterLayout className={css({ justifyItems: "center", gap: "8px" })}>
			<Text asChild size="5" weight="bold">
				<h1>新規登録</h1>
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
						name="email"
						type="email"
						inputMode="email"
						autoComplete="email"
						required
					/>
				</label>
				<Button type="submit">登録</Button>
			</Form>
		</CenterLayout>
	);
};

export const ErrorBoundary = () => {
	return <Text color="red">エラーが発生しました</Text>;
};

const actionSchema = zfd.formData({
	email: zfd.text(z.string().email()),
});

export const action = async ({ request }: ActionFunctionArgs) => {
	const { email } = actionSchema.parse(await request.formData());

	const existingUser = await prisma.user.findUnique({
		where: {
			email: email,
		},
		select: {
			id: true,
		},
	});
	if (existingUser) {
		await sendEmail({
			to: email,
			subject: "japanese-restream.org: 新規登録",
			body: "このEメールアドレスは既にユーザー登録されています",
		});
		return null;
	}

	const token = createToken();

	await prisma.userRegistration.upsert({
		where: {
			email: email,
		},
		create: {
			email: email,
			token,
		},
		update: {
			token,
		},
	});

	const url = new URL("/verify-registration", env.SERVER_ORIGIN);
	url.searchParams.set("token", token);

	await sendEmail({
		to: email,
		subject: "japanese-restream.org: 新規登録",
		body: [
			"このメールは、japanese-restream.org にて新規登録を行ったことを確認するために送信されています。以下のリンクをクリックして新規登録を完了してください。",
			url.href,
			"もし、japanese-restream.org にて新規登録を行っていない場合は、このメールを破棄してください。",
		].join("\n\n"),
	});

	return null;
};
