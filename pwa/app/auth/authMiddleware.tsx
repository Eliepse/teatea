import { redirect } from "react-router";
import { TokenUtils } from "~/auth/hooks/useToken";
import { refreshToken } from "~/auth/requests";

export async function authMiddleware() {
	if (null === TokenUtils.get()) {
		try {
			await refreshToken();
		} catch (e) {
			console.error(e);
			throw redirect("/");
		}
	}

	const token = TokenUtils.get();

	if (!token) {
		throw redirect("/");
	}

	if (false === token.roles.includes("ROLE_USER") || token.roles.includes("ROLE_ONBOARDING")) {
		throw redirect("/onboarding");
	}
}
