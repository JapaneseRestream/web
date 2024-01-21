import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production"]),
	SERVER_ORIGIN: z.string().url(),
	SESSION_COOKIE_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
