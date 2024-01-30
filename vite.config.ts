import * as fs from "fs/promises";
import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

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
		https: {
			cert: await fs.readFile(
				"./local-proxy/www.japanese-restream.org.localhost.pem",
			),
			key: await fs.readFile(
				"./local-proxy/www.japanese-restream.org.localhost-key.pem",
			),
		},
	},
	clearScreen: false,
});
