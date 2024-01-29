import { Button, Code, Text } from "@radix-ui/themes";
import { css } from "../../../styled-system/css";
import { json, useLoaderData } from "@remix-run/react";
import { createDiscordOauthUrl } from "../discord-oauth.server";
import { assertSession } from "../session.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "../../shared/prisma.server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const session = await assertSession(request);

	const { url, setCookie } = createDiscordOauthUrl();

	const userDiscord = await prisma.userDiscord.findUnique({
		where: { userId: session.user.id },
		select: {
			username: true,
		},
	});
	const discordUsername = userDiscord?.username;

	return json(
		{
			email: session.user.email,
			discordUsername,
			discordOauthUrl: url,
		},
		{ headers: [["Set-Cookie", setCookie]] },
	);
};

export default function FinishRegistration() {
	const data = useLoaderData<typeof loader>();

	return (
		<div
			className={css({
				display: "grid",
				alignContent: "start",
				justifyContent: "center",
				gap: "16px",
			})}
		>
			<dl>
				<Text size="5" weight="bold" asChild>
					<dt
						className={css({
							display: "grid",
							gridAutoFlow: "column",
							alignItems: "center",
							justifyContent: "start",
							gap: "4px",
						})}
					>
						<FontAwesomeIcon icon={faEnvelope} />
						<span>Eメールアドレス</span>
					</dt>
				</Text>
				<dd className={css({ marginLeft: "16px" })}>
					<Code>{data.email}</Code>
				</dd>
			</dl>
			<dl>
				<Text size="5" weight="bold" asChild>
					<dt
						className={css({
							display: "grid",
							gridAutoFlow: "column",
							alignItems: "center",
							justifyContent: "start",
							gap: "4px",
						})}
					>
						<FontAwesomeIcon icon={faDiscord} />
						<span>Discord</span>
					</dt>
				</Text>
				<dd
					className={css({
						marginLeft: "16px",
						display: "grid",
						gridAutoFlow: "column",
						justifyContent: "start",
						alignItems: "center",
						gap: "16px",
					})}
				>
					{data.discordUsername ? (
						<>
							<Code>{data.discordUsername}</Code>
							<Button asChild>
								<a href={data.discordOauthUrl}>再連携</a>
							</Button>
						</>
					) : (
						<Button asChild>
							<a href={data.discordOauthUrl}>Discordアカウントを連携</a>
						</Button>
					)}
				</dd>
			</dl>
		</div>
	);
}
