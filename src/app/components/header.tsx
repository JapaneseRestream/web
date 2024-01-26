import { Button, Text } from "@radix-ui/themes";
import { css } from "../../../styled-system/css/css.js";
import icon from "../images/icon.png";
import { Link, useRevalidator } from "@remix-run/react";
import { trpc } from "../trpc.js";

export const AppHeader = ({ user }: { user?: { id: string } }) => {
	const revalidator = useRevalidator();

	const { mutate: signOut } = trpc.authentication.signOut.useMutation({
		onSuccess: () => {
			revalidator.revalidate();
		},
	});

	return (
		<header
			className={css({
				padding: "8px",
				backgroundColor: "cyan.500",
				display: "grid",
				gridTemplateColumns: "1fr auto",
			})}
		>
			<div
				className={css({
					display: "grid",
					gridAutoFlow: "column",
					justifyContent: "start",
					alignContent: "center",
					alignItems: "center",
					gap: "8px",
				})}
			>
				<img src={icon} alt="Japanese Restream" width="40" height="40" />
				<Text size="5" weight="bold" asChild>
					<Link to="/">Japanese Restream</Link>
				</Text>
			</div>
			<div
				className={css({
					display: "grid",
					gridAutoFlow: "column",
					gap: "4px",
					alignItems: "center",
				})}
			>
				{revalidator.state === "loading" ? null : user ? (
					<>
						<span>{user.id}</span>
						<Button
							onClick={() => {
								signOut();
							}}
						>
							ログアウト
						</Button>
					</>
				) : (
					<>
						<Button asChild>
							<Link to="/sign-in">ログイン</Link>
						</Button>
						<Button asChild>
							<Link to="/register">新規登録</Link>
						</Button>
					</>
				)}
			</div>
		</header>
	);
};
