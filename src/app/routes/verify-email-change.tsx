import { Text } from "@radix-ui/themes";
import type { LoaderFunctionArgs } from "@remix-run/node";

import { prisma } from "../../shared/prisma.server";
import { CenterLayout } from "../components/center-layout";
import { assertSession } from "../session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const session = await assertSession(request);

	const url = new URL(request.url);
	const token = url.searchParams.get("token");

	if (!token) {
		throw new Response("token missing", { status: 400 });
	}

	const emailChange = await prisma.userEmailChange.findUnique({
		where: {
			token,
			userId: session.user.id,
		},
		select: {
			id: true,
			email: true,
		},
	});

	if (!emailChange) {
		throw new Response("invalid token", { status: 400 });
	}

	await prisma.userEmailChange.delete({
		where: { id: emailChange.id },
	});

	await prisma.user.update({
		where: {
			id: session.user.id,
		},
		data: {
			email: emailChange.email,
		},
	});

	return null;
};

export default () => (
	<CenterLayout>
		<Text>Eメールアドレスを変更しました</Text>
	</CenterLayout>
);

export const ErrorBoundary = () => {
	return (
		<CenterLayout>
			<Text color="red">エラーが発生しました</Text>
		</CenterLayout>
	);
};
