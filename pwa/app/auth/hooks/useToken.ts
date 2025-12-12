import { LocalStorageUtils, useLocalStorage } from "~/utils/browser/useLocalStorage";
import { decodeJwt } from "jose";
import { getTime, isPast, toDate } from "date-fns";

const tokenKey = "token";
const refreshTokenKey = "refreshToken";

type RefreshTokenStoragePayload = { token: string; expiredAt: number };

type JWTokenPayload = {
	roles: string[];
	email: string;
	username: string;
};

export function useToken() {
	const tokenLC = useLocalStorage<string>(tokenKey);
	return [TokenUtils.get(), tokenLC[1], tokenLC[2]] as const;
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
		if (undefined === token.exp || Date.now() / 1_000 >= token.exp) {
			TokenUtils.clearToken();
			return null;
		}

		return token;
	},

	clear: () => {
		TokenUtils.clearToken();
		TokenUtils.clearRefreshToken();
	},
	clearToken: () => LocalStorageUtils.remove(tokenKey),
	clearRefreshToken: () => LocalStorageUtils.remove(refreshTokenKey),

	setRefreshToken: (rawToken: string, expiredAt: Date) => {
		LocalStorageUtils.store(refreshTokenKey, {
			token: rawToken,
			expiredAt: getTime(expiredAt),
		} satisfies RefreshTokenStoragePayload);
	},
	getRefreshToken: () => {
		const payload = LocalStorageUtils.get<RefreshTokenStoragePayload>(refreshTokenKey);

		if (null === payload) {
			return null;
		}

		if (isPast(toDate(payload.expiredAt))) {
			LocalStorageUtils.remove(refreshTokenKey);
			return null;
		}

		return payload.token;
	},
};
