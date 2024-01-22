import { router } from "./trpc.js";
import { registrationRouter } from "./routes/registration.js";
import { authenticationRouter } from "./routes/authentication.js";
import { adminRouter } from "./routes/admin.js";

export const appRouter = router({
	registration: registrationRouter,
	authentication: authenticationRouter,
	admin: adminRouter,
});

export type AppRouter = typeof appRouter;
