import {
	Datagrid,
	DateField,
	List,
	TextField,
	Edit,
	SimpleForm,
	TextInput,
	Create,
	ReferenceManyField,
} from "react-admin";

export const EventGroupList = () => (
	<List>
		<Datagrid rowClick="edit">
			<TextField source="slug" />
			<TextField source="shortName" />
			<TextField source="name" />
			<DateField source="createdAt" />
			<DateField source="updatedAt" />
		</Datagrid>
	</List>
);

export const EventGroupEdit = () => (
	<Edit>
		<SimpleForm>
			<TextInput source="slug" />
			<TextInput source="shortName" />
			<TextInput source="name" />
			<ReferenceManyField
				reference="event"
				target="eventGroupId"
				sort={{ field: "startDate", order: "ASC" }}
			>
				<Datagrid>
					<TextField source="slug" />
					<TextField source="shortName" />
					<TextField source="name" />
					<TextField source="startDate" />
				</Datagrid>
			</ReferenceManyField>
		</SimpleForm>
	</Edit>
);

export const EventGroupCreate = () => (
	<Create>
		<SimpleForm>
			<TextInput source="slug" />
			<TextInput source="shortName" />
			<TextInput source="name" />
		</SimpleForm>
	</Create>
);
