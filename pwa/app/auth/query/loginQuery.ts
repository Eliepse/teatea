import { TokenUtils } from "~/auth/hooks/useToken";
import { LocalStorageUtils } from "~/utils/browser/useLocalStorage";
import posthog from "posthog-js";
import axios from "axios";
import type { OTPResponse } from "~/auth/requests";

export async function loginDevMode(token: string) {
	if (!import.meta.env.DEV) {
		throw new Error("Not in dev mode");
	}

	const data = (await axios.post<OTPResponse>(`/auth/dev/${token}`)).data;

	if (!("token" in data)) {
		throw new Error("Invalid auth");
	}

	TokenUtils.set(data.token);
	TokenUtils.setRefreshToken(data.refresh_token, new Date(data.refresh_token_expiration * 1_000));
	LocalStorageUtils.remove("otp_token");

	const userToken = TokenUtils.get();
	if (userToken) {
		posthog.identify(userToken.username, { username: userToken.username });
	}

	return true;
}
