import "./index.css";

import { Theme } from "@radix-ui/themes";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	type MetaFunction,
	json,
	useLoaderData,
} from "@remix-run/react";

import { css } from "../../styled-system/css/css.js";
import { ACTIVITY_COOKIE_NAME } from "../shared/constants.js";
import { renewSession } from "../shared/session.server.js";

import { AppHeader } from "./components/header.js";
import {
	activityCookieSetCookie,
	getSession,
	parseCookie,
	parseSessionToken,
	serializeSessionToken,
} from "./cookie.server.js";
import icon from "./images/icon.png";
import { TrpcProvider } from "./trpc.js";

export const meta: MetaFunction = () => [
	{ charSet: "utf-8" },
	{ title: "Japanese Restream" },
	{ name: "viewport", content: "width=device-width, initial-scale=1" },
];

export const links: LinksFunction = () => [
	{ rel: "icon", href: icon },
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Roboto:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap",
	},
];

const calcHeaders = async (request: Request) => {
	const cookies = parseCookie(request);
	const activityCookie = cookies[ACTIVITY_COOKIE_NAME];
	if (activityCookie) {
		return [];
	}
	const sessionToken = parseSessionToken(cookies);
	if (!sessionToken) {
		return [];
	}
	const newSessionToken = await renewSession(sessionToken);
	if (!newSessionToken) {
		return [];
	}
	return [
		["Set-Cookie", serializeSessionToken(newSessionToken)],
		["Set-Cookie", activityCookieSetCookie],
	] satisfies [string, string][];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const [headers, session] = await Promise.all([
		calcHeaders(request),
		getSession(request),
	]);
	const user = session
		? { id: session.user.id, email: session.user.email }
		: undefined;
	return json({ user }, { headers });
};

export default function App() {
	const data = useLoaderData<typeof loader>();

	return (
		<html lang="ja">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<Theme>
					<TrpcProvider>
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
									display: "grid",
									overflow: "auto",

									padding: "8px",
									md: {
										padding: "16px",
									},
								})}
							>
								<Outlet />
							</div>
						</div>
					</TrpcProvider>
				</Theme>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
