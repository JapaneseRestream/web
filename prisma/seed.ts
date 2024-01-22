import { Role } from "@prisma/client";
import { prisma } from "../shared/prisma";

await prisma.user.create({
	data: {
		email: "admin@example.com",
		UserRole: {
			create: {
				role: Role.Admin,
			},
		},
	},
});

await prisma.eventGroup.create({
	data: {
		slug: "gdq",
		shortName: "GDQ",
		name: "Games Done Quick",
	},
});
