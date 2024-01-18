import "./index.css";
import "@radix-ui/themes/styles.css";

import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	type MetaFunction,
} from "@remix-run/react";
import { Theme } from "@radix-ui/themes";
import { AppHeader } from "./components/header";
import type { LinksFunction } from "@remix-run/node";

import icon from "./images/icon.png";
import { TrpcProvider } from "./trpc";

export const meta: MetaFunction = () => [
	{ charSet: "utf-8" },
	{ title: "Japanese Restream" },
	{ name: "viewport", content: "width=device-width, initial-scale=1" },
];

export const links: LinksFunction = () => [{ rel: "icon", href: icon }];

const App = () => {
	return (
		<html lang="ja">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<Theme>
					<TrpcProvider>
						<AppHeader />
						<Outlet />
					</TrpcProvider>
				</Theme>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
};

export default App;
