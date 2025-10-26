import { TokenUtils } from "~/auth/hooks/useToken";
import { UnauthenticatedError } from "~/auth/errors/UnauthenticatedError";
import { ApiError } from "~/api/errors/ApiError";
import { refreshToken } from "~/auth/requests";
import type { Resource } from "~t/types";

type FetchApiConfig = Omit<RequestInit, "body" | "method"> &
	(
		| {
				method: "POST" | "PUT" | "PATCH" | "DELETE";
				payload?: string | number | object;
		  }
		| {
				method?: "GET";
				payload?: Record<string, string | number | undefined>;
		  }
	);

type TResponse<T = unknown> = Omit<Response, "json"> & { json: () => Promise<T> };

export async function fetchApi<T>(path: string, config?: FetchApiConfig): Promise<TResponse<T>> {
	const fetchConfigs: RequestInit = { ...config };
	const cleanedPath = path.startsWith("/api/") ? path.substring(4) : path;
	const oUrl = new URL(`${import.meta.env.PUBLIC_API_URL}${cleanedPath}`, window.location.toString());
	let searchParams = oUrl.searchParams;

	fetchConfigs.headers = new Headers({
		"Content-Type": "application/ld+json",
		Accept: "application/ld+json",
		...config?.headers,
	});

	let token = TokenUtils.getRaw();

	if (null === TokenUtils.get()) {
		await refreshToken();
		token = TokenUtils.getRaw();
	}

	if (null !== token) {
		fetchConfigs.headers.set("Authorization", `Bearer ${token}`);
	}

	if ((undefined === config?.method || "GET" === config?.method) && undefined !== config?.payload) {
		// @ts-ignore
		searchParams = new URLSearchParams([
			...Array.from(searchParams.entries()),
			...Object.entries(config.payload).filter(([_, v]) => !!v),
		]);
		fetchConfigs.body = undefined;
	} else if (undefined !== config?.method && undefined !== config?.payload) {
		fetchConfigs.body = "string" === typeof config.payload ? config.payload : JSON.stringify(config.payload);
	}

	const url = new URL(`${oUrl.origin}${oUrl.pathname}?${searchParams}`);
	let response: Response | undefined;

	try {
		response = await fetch(url, fetchConfigs);
	} catch (e) {
		console.warn(`Request to ${url} failed`);
		console.warn(e);
		throw e;
	}

	if (401 === response.status) {
		// Only reset the token. The refresh token is probably still
		// valid and we want to trigger a refresh, not a logout
		TokenUtils.clearToken();
		throw new UnauthenticatedError(response);
	}

	if (200 > response.status || 300 <= response.status) {
		throw await ApiError.fromResponse(response);
	}

	return response;
}

export async function getApi<T>(
	url: string,
	payload?: Record<string, string | number | undefined>,
	config?: Omit<FetchApiConfig, "payload" | "method">,
): Promise<TResponse<T>> {
	return fetchApi<T>(url, { ...config, method: "GET", payload });
}

export async function postApi<T>(
	url: string,
	payload: string | number | object,
	config?: Omit<FetchApiConfig, "payload" | "method">,
): Promise<TResponse<T>> {
	return fetchApi<T>(url, { ...config, method: "POST", payload });
}

export async function patchApi<T>(
	url: string,
	payload: object,
	config?: Omit<FetchApiConfig, "payload" | "method">,
): Promise<TResponse<T>> {
	return fetchApi<T>(url, {
		...config,
		method: "PATCH",
		payload,
		headers: {
			...config?.headers,
			"Content-Type": "application/merge-patch+json",
		},
	});
}

export async function deleteApi<T>(
	url: string | Resource,
	config?: Omit<FetchApiConfig, "method">,
): Promise<TResponse<T>> {
	return fetchApi<T>(typeof url === "string" ? url : url["@id"], { ...config, method: "DELETE" });
}
