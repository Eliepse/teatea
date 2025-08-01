import { LocalStorageUtils, useLocalStorage } from "~/utils/browser/useLocalStorage";
import { decodeJwt } from "jose";

const tokenKey = "token";

type JWTokenPayload = {
	roles: string[];
	email: string;
};

export function useToken() {
	return useLocalStorage<string>(tokenKey);
}

export const TokenUtils = {
	set: (rawToken: string) => LocalStorageUtils.store(tokenKey, rawToken),
	getRaw: () => LocalStorageUtils.get(tokenKey),

	/**
	 * Return a valid token, or null (null too when expired)
	 */
	get: () => {
		const rawToken = TokenUtils.getRaw();

		if ("string" !== typeof rawToken) {
			return null;
		}

		const token = decodeJwt<JWTokenPayload>(rawToken);

		// Clear the token if invalid
		if (undefined === token.exp || (Date.now() / 1_000) >= token.exp) {
			TokenUtils.clear();
			return null;
		}

		return token;
	},

	clear: () => LocalStorageUtils.remove(tokenKey),
};
