import { json, redirect } from "@remix-run/react";

import { prisma } from "../../shared/prisma.server";

export const loader = async () => {
	const latestEvent = await prisma.event.findFirst({
		where: { finished: true },
		orderBy: { startDate: "desc" },
		select: { id: true, shortName: true },
	});

	if (!latestEvent) {
		throw json("event not found", 404);
	}

	throw redirect(latestEvent.shortName);
};

export default function ArchivesPage() {
	return "null";
}
