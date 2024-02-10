import react from "@vitejs/plugin-react";
import { defineConfig, splitVendorChunkPlugin } from "vite";

export default defineConfig({
	plugins: [react(), splitVendorChunkPlugin()],
	base: "/admin",
	server: {
		host: "0.0.0.0",
		port: 4000,
		origin: "https://www.japanese-restream.org.localhost",
	},
	build: {
		outDir: "../../dist/admin",
		emptyOutDir: true,
	},
	clearScreen: false,
});
