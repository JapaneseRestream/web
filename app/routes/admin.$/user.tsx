import { Datagrid, DateField, List, TextField } from "react-admin";

export const UserList = () => (
	<List>
		<Datagrid rowClick="edit">
			<TextField source="email" />
			<DateField source="createdAt" />
			<DateField source="updatedAt" />
		</Datagrid>
	</List>
);
