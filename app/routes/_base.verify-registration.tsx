import { Text } from "@radix-ui/themes";
import { useNavigate } from "@remix-run/react";
import { trpc } from "../trpc.js";
import { useEffect, useRef, useState } from "react";
import { TRPCClientError } from "@trpc/client";
import { css } from "../../styled-system/css/css.js";

export default function VerifyRegistration() {
	const navigate = useNavigate();
	const [error, setError] = useState<string>();
	const { mutate: verifyToken } = trpc.registration.verify.useMutation({
		onSuccess: () => {
			navigate({ pathname: "/finish-registration" });
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
			verifyToken({ token });
		}
	}, [verifyToken]);

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
