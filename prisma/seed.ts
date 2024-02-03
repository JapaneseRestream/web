import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const devSeed = async () => {
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
			shortName: "GDQ",
			name: "Games Done Quick",
		},
	});
	const ff = await prisma.eventGroup.create({
		data: {
			shortName: "FF",
			name: "Frame Fatales",
		},
	});
	const esa = await prisma.eventGroup.create({
		data: {
			shortName: "ESA",
			name: "European Speedrunner Assembly",
		},
	});

	await prisma.event.create({
		data: {
			eventGroupId: gdq.id,
			shortName: "AGDQ2024",
			name: "Awesome Games Done Quick 2024",
			startDate: new Date("2024-01-15T01:30:00+0900"),
			finished: false,
			dataSourceType: "GDQ",
			dataSourceId: "46",
		},
	});
	await prisma.event.create({
		data: {
			eventGroupId: gdq.id,
			shortName: "SGDQ2024",
			name: "Summer Games Done Quick 2024",
			startDate: new Date("2024-07-01T02:30:00+0900"),
			finished: false,
			dataSourceType: "GDQ",
			dataSourceId: "48",
		},
	});
	await prisma.event.create({
		data: {
			eventGroupId: ff.id,
			shortName: "FrostFatales2024",
			name: "Frost Fatales 2024",
			startDate: new Date("2024-03-04T02:30:00+0900"),
			finished: false,
			dataSourceType: "GDQ",
			dataSourceId: "47",
		},
	});

	await prisma.event.create({
		data: {
			eventGroupId: gdq.id,
			shortName: "SGDQ2019",
			name: "Summer Games Done Quick 2019",
			startDate: new Date("2019-06-24T01:30:00+0900"),
			finished: true,
			dataSourceType: "GDQ",
			dataSourceId: "26",
		},
	});
	await prisma.event.create({
		data: {
			eventGroupId: esa.id,
			shortName: "ESAS2019",
			name: "ESA Summer 2019",
			startDate: new Date("2019-07-20T21:00:00+0900"),
			finished: true,
			dataSourceType: "ESA",
			dataSourceId: "UNKNOWN",
		},
	});
	await prisma.event.create({
		data: {
			eventGroupId: gdq.id,
			shortName: "AGDQ2020",
			name: "Awesome Games Done Quick 2020",
			startDate: new Date("2020-01-05T01:30:00+0900"),
			finished: true,
			dataSourceType: "GDQ",
			dataSourceId: "34",
		},
	});
	await prisma.event.create({
		data: {
			eventGroupId: gdq.id,
			shortName: "SGDQ2020",
			name: "Summer Games Done Quick 2020",
			startDate: new Date("2020-08-16T02:30:00+0900"),
			finished: true,
			dataSourceType: "GDQ",
			dataSourceId: "36",
		},
	});
	await prisma.event.create({
		data: {
			eventGroupId: ff.id,
			shortName: "FrameFatales2020",
			name: "Frame Fatales 2020",
			startDate: new Date("2020-07-31T02:30:00+0900"),
			finished: true,
			dataSourceType: "GDQ",
			dataSourceId: "35",
		},
	});
	await prisma.event.create({
		data: {
			eventGroupId: gdq.id,
			shortName: "AGDQ2021",
			name: "Awesome Games Done Quick 2021",
			startDate: new Date("2021-01-03T01:30:00+0900"),
			finished: true,
			dataSourceType: "GDQ",
			dataSourceId: "38",
		},
	});
	await prisma.event.create({
		data: {
			eventGroupId: gdq.id,
			shortName: "SGDQ2021",
			name: "Summer Games Done Quick 2021",
			startDate: new Date("2021-07-04T02:30:00+0900"),
			finished: true,
			dataSourceType: "GDQ",
			dataSourceId: "40",
		},
	});
	await prisma.event.create({
		data: {
			eventGroupId: ff.id,
			shortName: "FrameFatales2021",
			name: "Frame Fatales 2021",
			startDate: new Date("2021-07-30T02:30:00+0900"),
			finished: true,
			dataSourceType: "GDQ",
			dataSourceId: "39",
		},
	});
	await prisma.event.create({
		data: {
			eventGroupId: gdq.id,
			shortName: "AGDQ2022",
			name: "Awesome Games Done Quick 2022",
			startDate: new Date("2022-01-09T01:30:00+0900"),
			finished: true,
			dataSourceType: "GDQ",
			dataSourceId: "42",
		},
	});
	await prisma.event.create({
		data: {
			eventGroupId: gdq.id,
			shortName: "SGDQ2022",
			name: "Summer Games Done Quick 2022",
			startDate: new Date("2022-07-03T02:30:00+0900"),
			finished: true,
			dataSourceType: "GDQ",
			dataSourceId: "44",
		},
	});
	await prisma.event.create({
		data: {
			eventGroupId: ff.id,
			shortName: "FrameFatales2022",
			name: "Frame Fatales 2022",
			startDate: new Date("2022-07-29T02:30:00+0900"),
			finished: true,
			dataSourceType: "GDQ",
			dataSourceId: "43",
		},
	});
	await prisma.event.create({
		data: {
			eventGroupId: gdq.id,
			shortName: "AGDQ2023",
			name: "Awesome Games Done Quick 2023",
			startDate: new Date("2023-01-08T01:30:00+0900"),
			finished: true,
			dataSourceType: "GDQ",
			dataSourceId: "UNKNOWN",
		},
	});
	await prisma.event.create({
		data: {
			eventGroupId: gdq.id,
			shortName: "SGDQ2023",
			name: "Summer Games Done Quick 2023",
			startDate: new Date("2023-07-02T02:30:00+0900"),
			finished: true,
			dataSourceType: "GDQ",
			dataSourceId: "UNKNOWN",
		},
	});
};

const prodSeed = async () => {
	await prisma.user.create({
		data: {
			email: "hoishinxii@gmail.com",
			UserRole: {
				create: {
					role: Role.Admin,
				},
			},
		},
	});
};

if (process.env.NODE_ENV === "production") {
	prodSeed();
} else {
	devSeed();
}
