import { Button, Text, TextField } from "@radix-ui/themes";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { css } from "../../../styled-system/css";
import { createToken } from "../../shared/create-token";
import { prisma } from "../../shared/prisma.server";
import { CenterLayout } from "../components/center-layout";
import { assertSession } from "../session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const session = await assertSession(request);
	return json({ email: session.user.email });
};

export default () => {
	const data = useLoaderData<typeof loader>();

	return (
		<CenterLayout className={css({ justifyItems: "center", gap: "8px" })}>
			<Text asChild size="5" weight="bold">
				<h1>Eメールアドレス変更</h1>
			</Text>
			<Form
				method="post"
				className={css({ display: "grid", justifyItems: "end", gap: "4px" })}
			>
				<label className={css({ width: "250px" })}>
					<Text>メールアドレス</Text>
					<TextField.Input
						name="email"
						type="email"
						inputMode="email"
						autoComplete="email"
						required
						defaultValue={data.email}
					/>
				</label>
				<Button type="submit">変更</Button>
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
	const [session, formData] = await Promise.all([
		assertSession(request),
		request.formData(),
	]);
	const { email } = actionSchema.parse(formData);
	const token = createToken();
	await prisma.userEmailChange.upsert({
		where: {
			userId: session.user.id,
		},
		create: {
			userId: session.user.id,
			email,
			token,
		},
		update: {
			email,
			token,
		},
	});

	return null;
};
