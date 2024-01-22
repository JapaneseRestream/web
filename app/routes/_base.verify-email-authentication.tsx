import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "../trpc";
import { useNavigate } from "@remix-run/react";
import { TRPCClientError } from "@trpc/client";

export default function VerifyEmailAuthentication() {
	const navigate = useNavigate();
	const { mutate: verify } = trpc.authentication.email.verify.useMutation({
		onSuccess: () => {
			navigate({ pathname: "/" });
		},
		onError: (error) => {
			if (error instanceof TRPCClientError) {
				if (error.message === "invalid token") {
					alert("無効なトークンか有効期限が切れています");
					navigate("/");
					return;
				}
			}
			alert("エラーが発生しました");
			navigate("/");
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
}
