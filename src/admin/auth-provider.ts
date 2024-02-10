import { serialize } from "cookie";

import { SIGN_IN_REDIRECT_COOKIE_NAME } from "../shared/constants";

import { trpc } from "./trpc";

const noop = async () => {
	// do nothing
};

export const authProvider = {
	checkAuth: async () => {
		const isSignedIn = await trpc.authentication.isSignedIn.query();
		if (!isSignedIn) {
			document.cookie = serialize(SIGN_IN_REDIRECT_COOKIE_NAME, "/admin");
			location.href = "/sign-in";
			return;
		}

		const roles = await trpc.authentication.roles.query();
		if (roles.includes("SuperAdmin") || roles.includes("Admin")) {
			return;
		}
		location.href = "/";
	},

	logout: async () => {
		await trpc.authentication.signOut.mutate();
		location.href = "/";
	},

	login: noop,
	checkError: noop,
	getPermissions: noop,
};
