import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production"]),
	LISTEN_PORT: z.coerce.number().int().positive(),
	SERVER_ORIGIN: z.string().url(),
	SSL_KEY: z.string(),
	SSL_CERT: z.string(),
	SESSION_COOKIE_SECRET: z.string(),
	DISCORD_CLIENT_ID: z.string(),
	DISCORD_CLIENT_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
