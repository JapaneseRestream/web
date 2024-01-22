import "./index.css";

import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Admin, EditGuesser, ListGuesser, Resource } from "react-admin";
import { getSession } from "../../cookie.server";
import { prisma } from "../../../shared/prisma";
import { Role } from "@prisma/client";
import { dataProvider } from "./data-provider";
import {
	EventGroupList,
	EventGroupEdit,
	EventGroupCreate,
} from "./event-group";
import { UserList } from "./user";
import { EventCreate, EventEdit, EventList } from "./event";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const session = await getSession(request);
	if (!session) {
		throw redirect("/sign-in");
	}

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
		throw redirect("/");
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
				recordRepresentation={(record) => record.shortName}
			/>
			<Resource
				name="event"
				list={EventList}
				edit={EventEdit}
				create={EventCreate}
				recordRepresentation={(record) => record.shortName}
			/>
		</Admin>
	);
}
