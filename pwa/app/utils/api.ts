import { TokenUtils } from "~/auth/hooks/useToken";
import { wait } from "~/utils/time";
import { UnauthenticatedError } from "~/auth/errors/UnauthenticatedError";

type FetchApiConfig = Omit<RequestInit, "body"> & {
	payload?: string | number | object | null;
};

type TResponse<T = unknown> = Omit<Response, "json"> & { json: () => Promise<T> };

export async function fetchApi<T>(url: string, config?: FetchApiConfig): Promise<TResponse<T>> {
	const startedAt = Date.now();
	const token = TokenUtils.getRaw();
	const fetchConfigs: RequestInit = { ...config };

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

	let response: Response | undefined;

	try {
		response = await fetch(`${import.meta.env.PUBLIC_API_URL}${url}`, fetchConfigs);
	} catch (e) {
		console.warn(`Request to ${url} failed`);
		console.warn(e);
		throw e;
	}

	if (401 === response.status) {
		TokenUtils.clear();
		throw new UnauthenticatedError(response);
	}

	const duration = Date.now() - startedAt;

	// Debug: Add a fake delay to make sure requests duration
	// is greater or equal to PUBLIC_API_FAKE_DELAY env
	if (true === import.meta.env.DEV && !!import.meta.env.PUBLIC_API_FAKE_DELAY) {
		const fakeDelayMs = parseInt(import.meta.env.PUBLIC_API_FAKE_DELAY);

		if (fakeDelayMs > duration) {
			await wait(fakeDelayMs - duration);
		}
	}

	return response;
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

export async function deleteApi<T>(url: string, config?: Omit<FetchApiConfig, "method">): Promise<TResponse<T>> {
	return fetchApi<T>(url, { ...config, method: "DELETE" });
}
