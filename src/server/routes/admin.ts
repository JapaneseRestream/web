import { router } from "../trpc";

import { eventRouter } from "./admin/event";
import { eventGroupRouter } from "./admin/event-group";
import { runRouter } from "./admin/run";
import { userRouter } from "./admin/user";

export const adminRouter = router({
	eventGroup: eventGroupRouter,
	user: userRouter,
	event: eventRouter,
	run: runRouter,
});
