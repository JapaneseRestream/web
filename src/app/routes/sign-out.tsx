import type { ActionFunctionArgs } from "@remix-run/node";

import { prisma } from "../../shared/prisma.server";
import { assertSession } from "../session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	const session = await assertSession(request);
	await prisma.userSession.delete({
		where: {
			token: session.token,
		},
	});
	return null;
};
