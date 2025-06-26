import { LocalStorageUtils, useLocalStorage } from "~/utils/browser/useLocalStorage";

const tokenKey = "token";

export function useToken() {
	return useLocalStorage<string>(tokenKey);
}

export const TokenUtils = {
	set: (token: string) => LocalStorageUtils.store(tokenKey, token),
	get: () => LocalStorageUtils.get(tokenKey),
	clear: () => LocalStorageUtils.remove(tokenKey)
};
