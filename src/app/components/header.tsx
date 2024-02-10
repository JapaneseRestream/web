import { Button, Text } from "@radix-ui/themes";
import { Link, useRevalidator } from "@remix-run/react";

import { css } from "../../../styled-system/css/css.js";
import { trpc } from "../trpc.js";
import icon from "../images/icon.png";

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
				gridTemplateColumns: "auto 1fr auto",
				gap: "8px",
			})}
		>
			<Link
				to="/"
				className={css({
					display: "grid",
					gridAutoFlow: "column",
					alignItems: "center",
					gap: "8px",
				})}
			>
				<img src={icon} alt="Japanese Restream" width="40" height="40" />
			</Link>
			<div
				className={css({
					display: "grid",
					gridAutoFlow: "column",
					justifyContent: "start",
					alignItems: "center",
					gap: "8px",
				})}
			>
				<Text size="3" weight="bold" asChild>
					<Link to="/archives">アーカイブ</Link>
				</Text>
				<Text size="3" weight="bold" asChild>
					<Link to="/sign-in-options">ログイン設定</Link>
				</Text>
			</div>
			<div
				className={css({
					display: "grid",
					gridAutoFlow: "column",
					alignItems: "center",
					gap: "4px",
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
