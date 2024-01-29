import { useNavigate } from "@remix-run/react";
import { trpc } from "../trpc.js";
import { useEffect, useRef } from "react";
import { TRPCClientError } from "@trpc/client";

export default function VerifyRegistration() {
	const navigate = useNavigate();
	const { mutate: verifyToken } = trpc.registration.verify.useMutation({
		onSuccess: () => {
			navigate({ pathname: "/sign-in-options" });
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
			verifyToken({ token });
		}
	}, [verifyToken]);
}
