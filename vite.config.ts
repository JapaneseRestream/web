import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		remix({
			appDirectory: "src/app",
		}),
	],
	clearScreen: false,
});
