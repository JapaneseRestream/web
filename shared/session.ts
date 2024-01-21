import { SESSION_TOKEN_DURATION } from "./constants.js";
import { createToken } from "./create-token.js";
import { prisma } from "./prisma.js";

export const createSession = async (
	opts: { newUser: true; email: string } | { newUser: false; userId: string },
) => {
	const token = createToken();

	if (opts.newUser) {
		await prisma.user.create({
			data: {
				email: opts.email,
				UserSession: {
					create: {
						token,
					},
				},
			},
		});
	} else {
		await prisma.userSession.create({
			data: {
				token,
				userId: opts.userId,
			},
		});
	}

	return token;
};

export const validateSession = async (sessionToken: string) => {
	const session = await prisma.userSession.findUnique({
		where: {
			token: sessionToken,
			createdAt: {
				gt: new Date(Date.now() - SESSION_TOKEN_DURATION),
			},
		},
		select: {
			id: true,
			user: {
				select: {
					id: true,
					email: true,
				},
			},
		},
	});
	return session;
};

export const renewSession = async (oldSessionToken: string) => {
	const session = await validateSession(oldSessionToken);
	if (!session) {
		return;
	}
	const newSessionToken = await createSession({
		newUser: false,
		userId: session.user.id,
	});
	await prisma.userSession.delete({
		where: {
			token: oldSessionToken,
		},
	});
	return newSessionToken;
};
