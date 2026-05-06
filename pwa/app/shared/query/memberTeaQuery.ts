import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection } from "~t/types";
import { type CollectionTeaRaw, denormalizeCollectionTea } from "~/utils/api/normalization/collectionTea";
import type { Pagination } from "~t/query";
import { queryOptions } from "@tanstack/react-query";
import type { SearchFilters } from "~/catalog/hooks/useSearchQuery";

export async function queryMemberTeaCollection(
	username: string,
	filters?: Partial<Pick<SearchFilters, "family">>,
	pagination?: Pagination,
) {
	const queryParams = { ...filters, ...pagination };
	const response = await getApi<ApiPaginatedCollection<CollectionTeaRaw>>(`/members/${username}/teas`, queryParams);
	const data = await response.json();
	return { ...data, member: data.member.map(denormalizeCollectionTea) };
}

export function makeMemberTeaCollectionQueryOpt(
	username: string,
	filters?: Partial<Pick<SearchFilters, "family">>,
	pagination?: Pagination,
) {
	return queryOptions({
		queryFn: async () => await queryMemberTeaCollection(username, filters, pagination),
		queryKey: ["collection_teas", { username, ...filters, ...pagination }],
		// staleTime: 60_000, // TODO(elie): add caching and cache busting on changes (delete/add/update)
	});
}
