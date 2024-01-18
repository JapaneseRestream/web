import { Button } from "@radix-ui/themes";
import { trpc } from "../trpc";

export default function Index() {
	const { mutate } = trpc.hello.useMutation({
		onSuccess: (data) => {
			console.log(data);
		},
	});

	return (
		<Button
			onClick={() => {
				mutate({ name: "Hoishin" });
			}}
		>
			hoge
		</Button>
	);
}
