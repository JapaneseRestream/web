import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fastify } from "fastify";
import { fastifyStatic } from "@fastify/static";
import { fastifyCookie } from "@fastify/cookie";
import {
	createRequestHandler,
	type RequestHandler,
} from "@mcansh/remix-fastify";
import {
	fastifyTRPCPlugin,
	type FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";

import { appRouter, type AppRouter } from "./router.js";
import { env } from "../shared/env.server.js";
import { createContext } from "./trpc.js";
import { syncDataSource } from "./jobs/sync-data-source.js";

const [sslKey, sslCert] = await Promise.all([
	fs.readFile(env.SSL_KEY),
	fs.readFile(env.SSL_CERT),
]);

const server = fastify({
	maxParamLength: 5000,
	http2: true,
	https: {
		key: sslKey,
		cert: sslCert,
	},
});

await server.register(fastifyCookie, {
	secret: env.SESSION_COOKIE_SECRET,
});

await server.register(fastifyTRPCPlugin, {
	prefix: "/api/trpc",
	trpcOptions: {
		router: appRouter,
		createContext,
		onError: (error) => {
			console.error(`[trpc] Error on ${error.path}:`, error.error);
		},
	},
} satisfies FastifyTRPCPluginOptions<AppRouter>);

let handler: RequestHandler;

if (process.env.NODE_ENV === "production") {
	await server.register(fastifyStatic, {
		root: path.join(import.meta.dirname, "../build/client/assets"),
		prefix: "/assets",
		wildcard: true,
		decorateReply: false,
		cacheControl: true,
		dotfiles: "allow",
		etag: true,
		maxAge: "1y",
		immutable: true,
		serveDotFiles: true,
		lastModified: true,
	});

	await server.register(fastifyStatic, {
		root: path.join(import.meta.dirname, "../build/client"),
		prefix: "/",
		wildcard: false,
		cacheControl: true,
		dotfiles: "allow",
		etag: true,
		maxAge: "1h",
		serveDotFiles: true,
		lastModified: true,
	});

	handler = createRequestHandler({
		// @ts-expect-error
		build: await import("../../build/server/index.js"),
	});
} else {
	const vite = await import("vite");
	const viteDevServer = await vite.createServer({
		server: { middlewareMode: true },
	});

	const { default: middie } = await import("@fastify/middie");
	await server.register(middie);
	await server.use(viteDevServer.middlewares);

	handler = createRequestHandler({
		build: (() =>
			viteDevServer.ssrLoadModule("virtual:remix/server-build")) as any,
	});
}

server.all("*", async (request, reply) => {
	await handler(request as any, reply as any);
});

const address = await server.listen({ port: env.LISTEN_PORT });

console.log(`server listening on ${address}`);

const sync = () => {
	syncDataSource().catch((error) => {
		console.error(error);
	});
};

sync();
setInterval(sync, 60 * 1000);
