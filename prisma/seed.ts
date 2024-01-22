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

await prisma.user.create({
	data: {
		email: "user@example.com",
	},
});

const gdq = await prisma.eventGroup.create({
	data: {
		slug: "gdq",
		shortName: "GDQ",
		name: "Games Done Quick",
	},
});
const ff = await prisma.eventGroup.create({
	data: {
		slug: "ff",
		shortName: "FF",
		name: "Frame Fatales",
	},
});

await prisma.event.create({
	data: {
		eventGroupId: gdq.id,
		slug: "agdq2024",
		shortName: "AGDQ2024",
		name: "Awesome Games Done Quick 2024",
		startDate: new Date("2024-01-15T01:30:00+0900"),
	},
});
await prisma.event.create({
	data: {
		eventGroupId: gdq.id,
		slug: "sgdq2024",
		shortName: "SGDQ2024",
		name: "Summer Games Done Quick 2024",
		startDate: new Date("2024-07-01T02:30:00+0900"),
	},
});
await prisma.event.create({
	data: {
		eventGroupId: ff.id,
		slug: "frostfatales2024",
		shortName: "FrostFatales2024",
		name: "Frost Fatales 2024",
		startDate: new Date("2024-03-04T02:30:00+0900"),
	},
});
