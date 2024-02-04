import type { PropsWithChildren } from "react";

import { css } from "../../../styled-system/css";

export const CenterLayout = ({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) => {
	return (
		<div
			className={
				css({ display: "grid", placeContent: "start center" }) + " " + className
			}
		>
			{children}
		</div>
	);
};
