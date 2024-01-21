import { randomBytes } from "node:crypto";

const TOKEN_LENGTH_BYTES = (255 / 4) * 3;

export const createToken = () => {
	return randomBytes(TOKEN_LENGTH_BYTES).toString("base64url");
};
