import "../index.css";
import "@radix-ui/themes/styles.css";
import "../theme-config.css";

import { Outlet, json, useLoaderData } from "@remix-run/react";
import { css } from "../../styled-system/css";
import { AppHeader } from "../components/header";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "../cookie.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const session = await getSession(request);
	return json({
		user: session
			? {
					id: session.user.id,
					email: session.user.email,
				}
			: undefined,
	});
};

export default function BaseLayout() {
	const data = useLoaderData<typeof loader>();

	return (
		<div
			className={css({
				height: "100vh",
				width: "100vw",
				display: "grid",
				gridTemplateRows: "auto 1fr",
				overflow: "hidden",
			})}
		>
			<AppHeader user={data.user} />
			<div
				className={css({
					height: "100%",
					width: "100%",
					padding: "16px",
					display: "grid",
					overflow: "auto",
				})}
			>
				<Outlet />
			</div>
		</div>
	);
}
