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
			<TextField source="shortName" />
			<TextField source="name" />
			<DateField source="createdAt" />
			<DateField source="updatedAt" />
		</Datagrid>
	</List>
);

export const EventGroupEdit = () => (
	<Edit mutationMode="pessimistic">
		<SimpleForm>
			<TextInput source="shortName" />
			<TextInput source="name" />
			<ReferenceManyField
				reference="event"
				target="eventGroupId"
				sort={{ field: "startDate", order: "ASC" }}
			>
				<Datagrid>
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
			<TextInput source="shortName" />
			<TextInput source="name" />
		</SimpleForm>
	</Create>
);
