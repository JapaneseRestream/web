import {
	Datagrid,
	Edit,
	FunctionField,
	List,
	NumberField,
	Pagination,
	ReferenceField,
	ReferenceInput,
	SimpleForm,
	TextField,
	TextInput,
	UrlField,
} from "react-admin";
import { secondsToDurationStr } from "../../../shared/duration";

export const RunList = () => (
	<List
		filters={[<ReferenceInput source="eventId" reference="event" />]}
		pagination={<Pagination rowsPerPageOptions={[50, 100, 200]} />}
		sort={{ field: "order", order: "ASC" }}
	>
		<Datagrid rowClick="edit">
			<ReferenceField source="eventId" reference="event" />
			<TextField source="title" />
			<TextField source="category" />
			<FunctionField
				source="duration"
				render={(record: { duration: number }) =>
					secondsToDurationStr(record.duration)
				}
			/>
			<FunctionField
				source="setupDuration"
				render={(record: { setupDuration: number }) =>
					secondsToDurationStr(record.setupDuration)
				}
			/>
			<NumberField source="order" />
			<TextField source="runners" />
			<UrlField source="twitchVodUrl" />
			<UrlField source="youtubeVodUrl" />
			<TextField source="originalId" />
			<TextField source="originalTitle" />
		</Datagrid>
	</List>
);

export const RunEdit = () => (
	<Edit mutationMode="pessimistic">
		<SimpleForm>
			<TextInput source="title" />
			<TextInput source="twitchVodUrl" />
			<TextInput source="youtubeVodUrl" />
		</SimpleForm>
	</Edit>
);
