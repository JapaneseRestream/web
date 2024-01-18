import { css } from "../../styled-system/css";
import icon from "../images/icon.png";

export const AppHeader = () => {
	return (
		<header className={css({ padding: "8px", backgroundColor: "cyan.500" })}>
			<img
				src={icon}
				alt="Japanese Restream"
				className={css({ width: "48px", height: "48px", rounded: "48px" })}
			/>
		</header>
	);
};
