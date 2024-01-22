import { useEffect, useMemo, useRef, useState } from "react";
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
				setError(error.message);
			} else {
				setError("unknown error");
			}
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

	const errorMessage = useMemo(() => {
		if (!error) {
			return;
		}
		if (error === "invalid token") {
			return "無効なトークンです";
		}
		return "不明なエラーが発生しました";
	}, [error]);

	return (
		<div
			className={css({
				display: "grid",
				alignContent: "start",
				justifyItems: "center",
			})}
		>
			<Text color="red">{errorMessage}</Text>
		</div>
	);
}
