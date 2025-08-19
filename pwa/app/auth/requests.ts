import { TokenUtils } from "~/auth/hooks/useToken";

export async function login(username: string): Promise<void> {
	const response = await fetch("/auth", {
		method: "POST",
		body: JSON.stringify({ email: username }),
		headers: {
			"Content-Type": "application/ld+json",
			Accept: "application/ld+json",
		},
	});
}

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
