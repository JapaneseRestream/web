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
	ArrayInput,
	SimpleFormIterator,
	BooleanField,
	BooleanInput,
	RadioButtonGroupInput,
} from "react-admin";
import { dataSourceType } from "../../../shared/constants";

export const EventList = () => (
	<List sort={{ field: "startDate", order: "ASC" }}>
		<Datagrid rowClick="edit">
			<ReferenceField source="eventGroupId" reference="eventGroup" />
			<TextField source="slug" />
			<TextField source="shortName" />
			<TextField source="name" />
			<DateField source="startDate" />
			<BooleanField source="finished" />
			<TextField source="dataSourceType" />
			<TextField source="dataSourceId" />
		</Datagrid>
	</List>
);

export const EventEdit = () => (
	<Edit mutationMode="pessimistic">
		<SimpleForm>
			<ReferenceInput source="eventGroupId" reference="eventGroup" />
			<TextInput source="slug" />
			<TextInput source="shortName" />
			<TextInput source="name" />
			<DateTimeInput source="startDate" />
			<BooleanInput source="finished" />
			<RadioButtonGroupInput
				source="dataSourceType"
				choices={dataSourceType.map((type) => ({ id: type, name: type }))}
			/>
			<TextInput source="dataSourceId" />
			<ArrayInput source="runs">
				<SimpleFormIterator inline disableAdd disableRemove disableClear>
					<TextInput source="title" />
					<TextInput source="category" />
					<TextInput source="duration" />
				</SimpleFormIterator>
			</ArrayInput>
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
			<BooleanInput source="finished" />
			<RadioButtonGroupInput
				source="dataSourceType"
				choices={dataSourceType.map((type) => ({ id: type, name: type }))}
			/>
			<TextInput source="dataSourceId" />
		</SimpleForm>
	</Create>
);
