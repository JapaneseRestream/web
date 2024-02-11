import "./index.css";

import { Text, Theme } from "@radix-ui/themes";
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
	useRouteError,
	isRouteErrorResponse,
} from "@remix-run/react";
import { type PropsWithChildren } from "react";

import { ACTIVITY_COOKIE_NAME } from "../shared/constants.js";
import { renewSession } from "../shared/session.server.js";

import { PageLayout } from "./components/page-layout.js";
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

const calcHeaders = async (request: Request): Promise<[string, string][]> => {
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
	];
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

const Document = ({ children }: PropsWithChildren) => {
	return (
		<html lang="ja">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<Theme>
					<TrpcProvider>{children}</TrpcProvider>
				</Theme>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
};

export default () => {
	const data = useLoaderData<typeof loader>();

	return (
		<Document>
			<PageLayout user={data.user}>
				<Outlet />
			</PageLayout>
		</Document>
	);
};

export const ErrorBoundary = () => {
	const error = useRouteError();

	return (
		<>
			<h1>
				{isRouteErrorResponse(error)
					? `${error.status} ${error.statusText}`
					: "Unknown Error"}
			</h1>
			<div>
				{isRouteErrorResponse(error) ? error.data : "An unknown error occurred"}
			</div>
		</>
	);
};
