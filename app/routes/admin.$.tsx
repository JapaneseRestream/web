import { Admin, type DataProvider, Resource, ListGuesser } from "react-admin";
import jsonServerProvider from "ra-data-json-server";
import { useEffect, useState } from "react";

export default function AdminPage() {
	const [dataProvider, setDataProvider] = useState<DataProvider>();
	useEffect(() => {
		setDataProvider(jsonServerProvider("https://jsonplaceholder.typicode.com"));
	}, []);
	return (
		<Admin basename="/admin" dataProvider={dataProvider}>
			<Resource name="posts" list={ListGuesser} />
			<Resource name="comments" list={ListGuesser} />
		</Admin>
	);
}
