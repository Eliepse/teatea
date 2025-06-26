import { TokenUtils } from "~/auth/hooks/useToken";
import { decodeJwt } from "jose";

export function isLoggedIn() {
	const token = TokenUtils.get() as string;

	if (null === token) {
		return false;
	}

	const decodedToken = decodeJwt(token);
	return !(decodedToken.exp && Date.now() < decodedToken.exp);
}
