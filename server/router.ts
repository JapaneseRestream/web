import { z } from "zod";
import { procedure, router } from "./trpc";

export const appRouter = router({
	hello: procedure
		.input(z.object({ name: z.string() }))
		.mutation(({ input }) => {
			return { message: `Hello ${input.name}!` };
		}),
});

export type AppRouter = typeof appRouter;
