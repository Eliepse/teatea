import { TokenUtils } from "~/auth/hooks/useToken";

type FetchApiConfig = Omit<RequestInit, "body"> & {
	payload?: string | number | object | null;
};

export async function fetchApi(url: string, config?: FetchApiConfig): Promise<Response> {
	const token = TokenUtils.get();
	const fetchConfigs: RequestInit = {  ...config };

	fetchConfigs.headers = new Headers({
		"Content-Type": "application/ld+json",
		Accept: "application/ld+json",
		...config?.headers,
	});

	if (null !== token) {
		fetchConfigs.headers.set("Authorization", `Bearer ${token}`);
	}

	if (undefined !== config?.payload) {
		fetchConfigs.body = "string" === typeof config.payload ? config.payload : JSON.stringify(config.payload);
	}

	const response = await fetch(`${import.meta.env.PUBLIC_API_URL}${url}`, fetchConfigs);

	if (401 === response.status) {
		TokenUtils.clear();
	}

	return response;
}
