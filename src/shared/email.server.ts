import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

import { env } from "./env.server";

const sesClient = new SESv2Client({ region: "ap-northeast-1" });

export const sendEmail = async (props: {
	to: string;
	subject: string;
	body: string;
}) => {
	if (env.NODE_ENV !== "production") {
		console.log(props);
		return;
	}
	const command = new SendEmailCommand({
		FromEmailAddress: "noreply@japanese-restream.org",
		Destination: {
			ToAddresses: [props.to],
		},
		Content: {
			Simple: {
				Subject: {
					Charset: "UTF-8",
					Data: props.subject,
				},
				Body: {
					Text: {
						Charset: "UTF-8",
						Data: props.body,
					},
				},
			},
		},
	});
	await sesClient.send(command);
};
