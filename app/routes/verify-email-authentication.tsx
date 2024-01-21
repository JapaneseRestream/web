import { useEffect, useRef, useState } from "react";
import { trpc } from "../trpc";
import { useNavigate } from "@remix-run/react";
import { TRPCClientError } from "@trpc/client";
import { css } from "../../styled-system/css";
import { Text } from "@radix-ui/themes";

export default function VerifyEmailAuthentication() {
	const navigate = useNavigate();
	const [error, setError] = useState<string>();
	const { mutate: verify } = trpc.authentication.email.verify.useMutation({
		onSuccess: () => {
			navigate({ pathname: "/" });
		},
		onError: (error) => {
			if (error instanceof TRPCClientError) {
				if (error.message === "invalid token") {
					setError("無効なトークンか有効期限が切れています");
					return;
				}
			}
			setError("エラーが発生しました");
		},
	});

	const running = useRef(false);
	useEffect(() => {
		if (running.current) {
			return;
		}
		running.current = true;
		const searchParams = new URLSearchParams(window.location.search);
		const token = searchParams.get("token");
		if (token) {
			verify({ token });
		}
	}, []);

	return (
		<div
			className={css({
				display: "grid",
				alignContent: "start",
				justifyItems: "center",
			})}
		>
			{error && <Text color="red">{error}</Text>}
		</div>
	);
}
