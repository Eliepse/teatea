import { TokenUtils } from "~/auth/hooks/useToken";
import { wait } from "~/utils/time";

type FetchApiConfig = Omit<RequestInit, "body"> & {
	payload?: string | number | object | null;
};

export async function fetchApi(url: string, config?: FetchApiConfig): Promise<Response> {
	const startedAt = Date.now();
	const token = TokenUtils.get();
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

	let response;

	try {
		response = await fetch(`${import.meta.env.PUBLIC_API_URL}${url}`, fetchConfigs);
	} catch (e) {
		console.warn(`Request to ${url} failed`);
		console.warn(e);
		throw e;
	}

	if (401 === response.status) {
		TokenUtils.clear();
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
