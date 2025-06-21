export async function fetchApi(url: string, config?: Parameters<typeof fetch>[1]): Promise<Response> {
	return await fetch(`${import.meta.env.PUBLIC_API_URL}${url}`, {
		...config,
		headers: {
			"Content-Type": "application/ld+json",
			Accept: "application/ld+json",
			...config?.headers,
		},
	});
}
