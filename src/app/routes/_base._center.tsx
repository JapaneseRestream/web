import { Outlet } from "@remix-run/react";
import { css } from "../../../styled-system/css";

export default () => {
	return (
		<div className={css({ display: "grid", placeContent: "start center" })}>
			<Outlet />
		</div>
	);
};
