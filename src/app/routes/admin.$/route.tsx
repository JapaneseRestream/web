import "./index.css";

import { Role } from "@prisma/client";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Admin, Resource } from "react-admin";

import { prisma } from "../../../shared/prisma.server";
import { assertSession } from "../../session.server";

import { dataProvider } from "./data-provider";
import { EventCreate, EventEdit, EventList } from "./event";
import {
	EventGroupList,
	EventGroupEdit,
	EventGroupCreate,
} from "./event-group";
import { RunEdit, RunList } from "./run";
import { UserList } from "./user";


export const loader = async ({ request }: LoaderFunctionArgs) => {
	const session = await assertSession(request);

	const adminRole = await prisma.userRole.findFirst({
		where: {
			userId: session.user.id,
			role: Role.Admin,
		},
		select: {
			role: true,
		},
	});

	if (!adminRole) {
		throw new Response(null, { status: 404 });
	}

	return null;
};

export default function AdminPage() {
	return (
		<Admin basename="/admin" dataProvider={dataProvider}>
			<Resource name="user" list={UserList} />
			<Resource
				name="eventGroup"
				list={EventGroupList}
				edit={EventGroupEdit}
				create={EventGroupCreate}
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				recordRepresentation={(record) => record.shortName as string}
			/>
			<Resource
				name="event"
				list={EventList}
				edit={EventEdit}
				create={EventCreate}
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				recordRepresentation={(record) => record.shortName as string}
			/>
			<Resource name="run" list={RunList} edit={RunEdit} />
		</Admin>
	);
}
