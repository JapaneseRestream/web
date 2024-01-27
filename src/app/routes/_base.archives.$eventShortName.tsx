import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "../../shared/prisma.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { eventShortName } = params;
	if (!eventShortName) {
		throw json("event not found", 404);
	}

	const [eventList, event] = await Promise.all([
		prisma.event.findMany({
			where: { finished: true },
			orderBy: { startDate: "desc" },
		}),
		prisma.event.findUnique({
			where: { shortName: eventShortName },
			select: {
				Run: true,
			},
		}),
	]);

	if (!event) {
		throw json("event not found", 404);
	}

	return json({ events: eventList, runs: event.Run });
};

export default function ArchivesPage() {
	const data = useLoaderData<typeof loader>();
	console.log(data);
	return "null";
}
