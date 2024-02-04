import { Button, Code, IconButton, Table, Text } from "@radix-ui/themes";
import { css } from "../../../styled-system/css";
import { json, useLoaderData, useRevalidator } from "@remix-run/react";
import { createDiscordOauthUrl } from "../discord-oauth.server";
import { assertSession } from "../session.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "../../shared/prisma.server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import { trpc } from "../trpc";
import { startRegistration } from "@simplewebauthn/browser";
import { CenterLayout } from "../components/center-layout";
import { getPasskeyName } from "../../server/lib/passkey-aaguid";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const session = await assertSession(request);

	const { url: discordOauthUrl, setCookie } = createDiscordOauthUrl();

	const [userDiscord, authenticators] = await Promise.all([
		prisma.userDiscord.findUnique({
			where: { userId: session.user.id },
			select: {
				username: true,
			},
		}),
		prisma.userPasskeyAuthenticator.findMany({
			where: { userId: session.user.id },
			select: {
				id: true,
				aaguid: true,
				createdAt: true,
				lastUsedAt: true,
			},
			orderBy: [{ lastUsedAt: "desc" }, { createdAt: "desc" }],
		}),
	]);
	const discordUsername = userDiscord?.username;

	const passkeys = authenticators.map((authenticator) => ({
		id: authenticator.id,
		name: getPasskeyName(authenticator.aaguid),
		createdAt: authenticator.createdAt,
		lastUsedAt: authenticator.lastUsedAt,
	}));

	return json(
		{
			email: session.user.email,
			discordUsername,
			discordOauthUrl,
			passkeys,
		},
		{ headers: [["Set-Cookie", setCookie]] },
	);
};

export default function FinishRegistration() {
	const data = useLoaderData<typeof loader>();
	const { mutateAsync: initializePasskeyRegistration } =
		trpc.authentication.passkey.registration.initialize.useMutation();
	const { mutateAsync: verifyPasskeyRegistration } =
		trpc.authentication.passkey.registration.verify.useMutation();
	const { mutateAsync: deletePasskey } =
		trpc.authentication.passkey.delete.useMutation();

	const revalidator = useRevalidator();

	return (
		<CenterLayout>
			<dl
				className={css({
					"& > dd": { margin: "0 0 16px 16px" },
				})}
			>
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
				<dd>
					<Code>{data.email}</Code>
				</dd>
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
						<FontAwesomeIcon icon={faKey} />
						<span>パスキー</span>
					</dt>
				</Text>
				<dd>
					<Button
						onClick={() => {
							(async () => {
								try {
									const options = await initializePasskeyRegistration();
									const response = await startRegistration(options);
									await verifyPasskeyRegistration(response);
									revalidator.revalidate();
								} catch (error) {
									console.error(error);
									alert("エラーが発生しました");
								}
							})();
						}}
					>
						新規登録
					</Button>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.ColumnHeaderCell>名前</Table.ColumnHeaderCell>
								<Table.ColumnHeaderCell>登録日時</Table.ColumnHeaderCell>
								<Table.ColumnHeaderCell>使用日時</Table.ColumnHeaderCell>
								<Table.ColumnHeaderCell></Table.ColumnHeaderCell>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{data.passkeys.map((passkey) => (
								<Table.Row key={passkey.id}>
									<Table.Cell>{passkey.name}</Table.Cell>
									<Table.Cell>
										{new Date(passkey.createdAt).toLocaleString()}
									</Table.Cell>
									<Table.Cell>
										{passkey.lastUsedAt
											? new Date(passkey.lastUsedAt).toLocaleString()
											: "-"}
									</Table.Cell>
									<Table.Cell>
										<IconButton
											size="1"
											color="red"
											onClick={() => {
												if (
													confirm(
														`本当にこのパスキーを削除しますか? (${passkey.name})`,
													)
												) {
													(async () => {
														try {
															await deletePasskey({ id: passkey.id });
															revalidator.revalidate();
														} catch (error) {
															console.error(error);
															alert("エラーが発生しました");
														}
													})();
												}
											}}
										>
											<FontAwesomeIcon icon={faTrashCan} />
										</IconButton>
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
				</dd>
			</dl>
		</CenterLayout>
	);
}
