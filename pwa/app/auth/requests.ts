import { TokenUtils } from "~/auth/hooks/useToken";
import axios from "axios";
import { LocalStorageUtils } from "~/utils/browser/useLocalStorage";
import { isPast } from "date-fns";

export type OTPToken = { value: string; expiredAt: Date };
type OTPResponse =
	| {
			token: string;
			refresh_token: string;
			refresh_token_expiration: number;
	  }
	| {
			message?: string;
	  };

export async function refreshToken(): Promise<void> {
	const refreshToken = TokenUtils.getRefreshToken();

	if (null === refreshToken) {
		throw new Error("Invalid refresh token");
	}

	const response = await fetch("/auth/token/refresh", {
		method: "POST",
		body: JSON.stringify({ refresh_token: refreshToken }),
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
	});

	const data = (await response.json()) as { token: string };

	if (!data.token) {
		throw new Error("Failed to refresh the token");
	}

	TokenUtils.set(data.token);
}

export async function verifyOTPToken(token: string): Promise<void> {
	return await axios.post("/auth/otp/verify", { challenge: token });
}

export async function attemptOTPLogin(token: OTPToken): Promise<boolean> {
	if (isPast(token.expiredAt)) {
		return false;
	}

	const response = await axios.post<OTPResponse>("/auth/otp", { challenge: token.value });
	const data = response.data;

	if ("token" in data) {
		TokenUtils.set(data.token);
		TokenUtils.setRefreshToken(data.refresh_token, new Date(data.refresh_token_expiration * 1_000));
		LocalStorageUtils.remove("otp_token");
		return true;
	}

	if ("message" in data) {
		LocalStorageUtils.remove("otp_token");
		throw new Error(data.message);
	}

	return false;
}
