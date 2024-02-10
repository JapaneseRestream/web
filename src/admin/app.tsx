import "./index.css";

import { Admin, Resource } from "react-admin";

import { authProvider } from "./auth-provider";
import { dataProvider } from "./data-provider";
import { EventCreate, EventEdit, EventList } from "./event";
import {
	EventGroupList,
	EventGroupEdit,
	EventGroupCreate,
} from "./event-group";
import { RunEdit, RunList } from "./run";
import { UserList } from "./user";

export const App = () => {
	return (
		<Admin
			basename="/admin"
			dataProvider={dataProvider}
			authProvider={authProvider}
		>
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
};
