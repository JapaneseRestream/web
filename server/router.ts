import { router } from "./trpc.js";
import { registrationRouter } from "./routes/registration.js";
import { authenticationRouter } from "./routes/authentication.js";

export const appRouter = router({
	registration: registrationRouter,
	authentication: authenticationRouter,
});

export type AppRouter = typeof appRouter;
