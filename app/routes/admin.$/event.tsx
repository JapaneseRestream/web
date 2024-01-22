import {
	Datagrid,
	DateField,
	List,
	ReferenceField,
	TextField,
	Edit,
	ReferenceInput,
	SimpleForm,
	TextInput,
	DateTimeInput,
	Create,
} from "react-admin";

export const EventList = () => (
	<List sort={{ field: "startDate", order: "ASC" }}>
		<Datagrid rowClick="edit">
			<ReferenceField source="eventGroupId" reference="eventGroup" />
			<TextField source="slug" />
			<TextField source="shortName" />
			<TextField source="name" />
			<DateField source="startDate" />
		</Datagrid>
	</List>
);

export const EventEdit = () => (
	<Edit>
		<SimpleForm>
			<ReferenceInput source="eventGroupId" reference="eventGroup" />
			<TextInput source="slug" />
			<TextInput source="shortName" />
			<TextInput source="name" />
			<DateTimeInput source="startDate" />
		</SimpleForm>
	</Edit>
);

export const EventCreate = () => (
	<Create>
		<SimpleForm>
			<ReferenceInput source="eventGroupId" reference="eventGroup" />
			<TextInput source="slug" />
			<TextInput source="shortName" />
			<TextInput source="name" />
			<DateTimeInput source="startDate" />
		</SimpleForm>
	</Create>
);
