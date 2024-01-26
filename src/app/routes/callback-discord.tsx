import { useEffect, useRef } from "react";
import { trpc } from "../trpc";
import { useNavigate } from "@remix-run/react";

export default function CallbackDiscord() {
	const navigate = useNavigate();
	const { mutate: verify } = trpc.authentication.discord.verify.useMutation({
		onSuccess: () => {
			navigate("/");
		},
		onError: () => {
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

		const url = new URL(window.location.href);
		const code = url.searchParams.get("code");
		const state = url.searchParams.get("state");
		if (!code || !state) {
			navigate("/");
			return;
		}

		verify({ code, state });
	}, []);
}
