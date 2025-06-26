import { TokenUtils } from "~/auth/hooks/useToken";

export async function fetchApi(url: string, config?: Parameters<typeof fetch>[1]): Promise<Response> {
	const token = TokenUtils.get();

	const headers = new Headers({
		"Content-Type": "application/ld+json",
		Accept: "application/ld+json",
		...config?.headers,
	});

	if (null !== token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	const response = await fetch(`${import.meta.env.PUBLIC_API_URL}${url}`, { ...config, headers });

	if (401 === response.status) {
		TokenUtils.clear();
	}

	return response;
}
