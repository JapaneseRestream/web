import { adminRouter } from "./routes/admin.js";
import { authenticationRouter } from "./routes/authentication.js";
import { router } from "./trpc.js";

export const appRouter = router({
	authentication: authenticationRouter,
	admin: adminRouter,
});

export type AppRouter = typeof appRouter;
