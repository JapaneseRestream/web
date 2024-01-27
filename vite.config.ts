import * as fs from "node:fs/promises";
import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		remix({
			appDirectory: "src/app",
		}),
	],
	server: {
		https:
			process.env.NODE_ENV === "production"
				? undefined
				: {
						key: await fs.readFile("./jr-web.localhost-key.pem"),
						cert: await fs.readFile("./jr-web.localhost.pem"),
					},
	},
	ssr: {
		noExternal: ["@radix-ui/themes"],
	},
	clearScreen: false,
});
