import { Button } from "@radix-ui/themes";
import { css } from "../../../styled-system/css";
import { json, useLoaderData } from "@remix-run/react";
import { createDiscordOauthUrl } from "../discord-oauth.server";
import { assertSession } from "../session.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await assertSession(request);

	const { url, setCookie } = createDiscordOauthUrl();
	return json(
		{ discordOauthUrl: url },
		{ headers: [["Set-Cookie", setCookie]] },
	);
};

export default function FinishRegistration() {
	const data = useLoaderData<typeof loader>();
	return (
		<div
			className={css({
				display: "grid",
				justifyContent: "center",
			})}
		>
			<Button asChild>
				<a href={data.discordOauthUrl}>Discordアカウントを連携</a>
			</Button>
		</div>
	);
}
