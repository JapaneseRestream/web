import * as path from "node:path";
import { DISCORD_API } from "../shared/constants.server";

export const apiUrl = (route: string) => {
	return path.join(DISCORD_API, route);
};
