import { router } from "./trpc.js";
import { authenticationRouter } from "./routes/authentication.js";
import { adminRouter } from "./routes/admin.js";

export const appRouter = router({
	authentication: authenticationRouter,
	admin: adminRouter,
});

export type AppRouter = typeof appRouter;
