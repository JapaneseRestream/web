import * as fs from "fs/promises";

import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

const loadHttpsConfig = async () => {
	if (process.env.NODE_ENV === "production") {
		return undefined;
	}
	const [cert, key] = await Promise.all([
		fs.readFile("./local-proxy/www.japanese-restream.org.localhost.pem"),
		fs.readFile("./local-proxy/www.japanese-restream.org.localhost-key.pem"),
	]);
	return { cert, key };
};

export default defineConfig({
	plugins: [
		remix({
			appDirectory: "src/app",
		}),
	],
	ssr: {
		noExternal: ["@radix-ui/themes"],
	},
	server: {
		https: await loadHttpsConfig(),
	},
	clearScreen: false,
});
