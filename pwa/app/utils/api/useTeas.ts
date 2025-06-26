import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchApi } from "~/utils/api";
import type { Tea } from "~t/types";

type Params = { searchText?: string, page?: number, limit?: number };

async function searchTeas(params: Params): Promise<{ member: Tea[] }> {
	const urlParams = new URLSearchParams();

	urlParams.set("page", (params.page ?? 1).toFixed(0));

	const response = await fetchApi(`/teas?${urlParams}`);
	return await response.json();
}

export function useTeas(params?: Params) {
	const filteredText = params?.searchText?.trim();
	const queryParams: Params = {
		searchText: filteredText ? `search:${filteredText}` : undefined,
		limit: params?.limit ?? 20
	};

	return useQuery({
		queryFn: async () => searchTeas(queryParams),
		queryKey: ["teas", queryParams],
		initialData: {member: []},
		placeholderData: keepPreviousData
	});
}
