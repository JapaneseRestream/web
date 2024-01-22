import { router } from "../trpc";
import { eventGroupRouter } from "./admin/event-group";

export const adminRouter = router({
	eventGroup: eventGroupRouter,
});
