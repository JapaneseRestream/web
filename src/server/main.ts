import { fastifyCookie } from "@fastify/cookie";
import { fastifyHelmet } from "@fastify/helmet";
import {
	createRequestHandler,
	type RequestHandler,
} from "@mcansh/remix-fastify";
import {
	fastifyTRPCPlugin,
	type FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import { fastify, type FastifyRequest } from "fastify";

import { env } from "../shared/env.server.js";

import { syncDataSource } from "./jobs/sync-data-source.js";
import { appRouter, type AppRouter } from "./router.js";
import { createContext } from "./trpc.js";

const server = fastify({
	maxParamLength: 5000,
});

await server.register(fastifyHelmet, {
	hsts: env.NODE_ENV === "production",
	contentSecurityPolicy: false,
});

server.addContentTypeParser(
	"application/x-www-form-urlencoded",
	(request: FastifyRequest) => request,
);

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
	handler = createRequestHandler({
		// @ts-expect-error - this is fine
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
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		build: (() =>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			viteDevServer.ssrLoadModule("virtual:remix/server-build")) as any,
	});
}

server.all("*", async (request, reply) => {
	await handler(request, reply);
});

const address = await server.listen({
	port: env.LISTEN_PORT,
	host: env.LISTEN_HOST,
});

console.log(`server listening on ${address}`);

const sync = () => {
	syncDataSource().catch((error) => {
		console.error(error);
	});
};

sync();
setInterval(sync, 60 * 1000);
