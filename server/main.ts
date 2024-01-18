import * as path from "node:path";

import { fastify } from "fastify";
import { fastifyStatic } from "@fastify/static";
import { createRequestHandler } from "@mcansh/remix-fastify";

const server = fastify();

if (process.env.NODE_ENV === "production") {
	await server.register(fastifyStatic, {
		root: path.join(import.meta.dirname, "build/client/assets"),
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
		root: path.join(import.meta.dirname, "build/client"),
		prefix: "/",
		wildcard: false,
		cacheControl: true,
		dotfiles: "allow",
		etag: true,
		maxAge: "1h",
		serveDotFiles: true,
		lastModified: true,
	});

	const handler = createRequestHandler({
		// @ts-expect-error
		build: await import("../build/server/index.js"),
	});

	server.all("*", (request, reply) => {
		handler(request, reply);
	});
} else {
	const vite = await import("vite");
	const viteDevServer = await vite.createServer({
		server: { middlewareMode: true },
	});
	const { default: middie } = await import("@fastify/middie");
	await server.register(middie);
	await server.use(viteDevServer.middlewares);

	const handler = createRequestHandler({
		build: (() =>
			viteDevServer.ssrLoadModule("virtual:remix/server-build")) as any,
	});

	server.all("*", (request, reply) => {
		handler(request, reply);
	});
}

const address = await server.listen({ port: 3000 });

console.log(`server listening on ${address}`);
