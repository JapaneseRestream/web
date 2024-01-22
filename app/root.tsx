import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	type MetaFunction,
	json,
} from "@remix-run/react";
import { Theme } from "@radix-ui/themes";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import icon from "./images/icon.png";
import { TrpcProvider } from "./trpc.js";
import { ACTIVITY_COOKIE_NAME } from "../shared/constants.js";
import {
	activityCookieSetCookie,
	parseCookie,
	parseSessionToken,
	serializeSessionToken,
} from "./cookie.server.js";
import { renewSession } from "../shared/session.js";

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
	const headers = await calcHeaders(request);
	return json(null, { headers });
};

export default function App() {
	return (
		<html lang="ja">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<Theme>
					<TrpcProvider>
						<Outlet />
					</TrpcProvider>
				</Theme>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
