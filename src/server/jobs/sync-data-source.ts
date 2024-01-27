import ky from "ky";
import { prisma } from "../../shared/prisma.server";
import { durationStrToSeconds } from "../../shared/duration";

export const syncDataSource = async () => {
	const events = await prisma.event.findMany({
		where: {
			finished: false,
		},
	});

	for (const event of events) {
		if (event.dataSourceType === "GDQ") {
			const baseUrl = "https://gamesdonequick.com/tracker/search";

			const runsUrl = new URL(baseUrl);
			runsUrl.searchParams.append("type", "run");
			runsUrl.searchParams.append("event", event.dataSourceId);
			const runnersUrl = new URL(baseUrl);
			runnersUrl.searchParams.append("type", "runner");
			runnersUrl.searchParams.append("event", event.dataSourceId);

			const [runsResponse, runnersResponse, existingRuns] = await Promise.all([
				ky(runsUrl.href).json<typeof import("./samples/gdq-runs.json")>(),
				ky(runnersUrl.href).json<typeof import("./samples/gdq-runners.json")>(),
				prisma.run.findMany({
					where: { eventId: event.id },
				}),
			]);

			const runs = runsResponse.map((run) => ({
				title: run.fields.name,
				category: run.fields.category,
				duration: durationStrToSeconds(run.fields.run_time),
				setupDuration: durationStrToSeconds(run.fields.setup_time),
				order: run.fields.order,
				runners: run.fields.runners
					.map((runnerId) =>
						runnersResponse.find((runner) => runner.pk === runnerId),
					)
					.map((runner) => runner?.fields.name ?? "???"),
				originalId: String(run.pk),
				originalTitle: run.fields.name,
			}));

			const runsToCreate = runs.filter(
				(run) =>
					!existingRuns.some(
						(existingRun) => existingRun.originalId === run.originalId,
					),
			);
			const runsToUpdate = runs.filter((run) =>
				existingRuns.some(
					(existingRun) =>
						existingRun.originalId === run.originalId &&
						(existingRun.category !== run.category ||
							existingRun.duration !== run.duration ||
							existingRun.setupDuration !== run.setupDuration ||
							existingRun.order !== run.order ||
							JSON.stringify(existingRun.runners) !==
								JSON.stringify(run.runners) ||
							existingRun.originalTitle !== run.originalTitle),
				),
			);
			const runsToDelete = existingRuns.filter(
				(existingRun) =>
					!runs.some((run) => run.originalId === existingRun.originalId),
			);

			await prisma.$transaction(async (tx) => {
				return Promise.all([
					tx.run.createMany({
						data: runsToCreate.map((run) => ({
							eventId: event.id,
							...run,
						})),
					}),
					...runsToUpdate.map((run) =>
						tx.run.update({
							where: {
								eventId_originalId: {
									eventId: event.id,
									originalId: run.originalId,
								},
							},
							data: {
								category: run.category,
								duration: run.duration,
								setupDuration: run.setupDuration,
								order: run.order,
								runners: run.runners,
								originalTitle: run.originalTitle,
							},
						}),
					),
					tx.run.deleteMany({
						where: {
							AND: [
								{ eventId: event.id },
								{
									originalId: {
										in: runsToDelete.map((run) => run.originalId),
									},
								},
							],
						},
					}),
				]);
			});
		}
	}
};
