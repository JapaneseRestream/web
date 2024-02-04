import aaguidData from "../../../vendors/passkey-authenticator-aaguids/combined_aaguid.json";

export const getPasskeyName = (aaguid: string) => {
	if (!(aaguid in aaguidData)) {
		return;
	}
	return aaguidData[aaguid as keyof typeof aaguidData].name;
};
