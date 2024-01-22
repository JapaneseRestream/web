import {
	Datagrid,
	DateField,
	List,
	TextField,
	Edit,
	SimpleForm,
	TextInput,
	Create,
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
