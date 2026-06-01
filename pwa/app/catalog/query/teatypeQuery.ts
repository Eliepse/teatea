import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, TeaType } from "~t/types";
import type { SearchFilters } from "~/catalog/hooks/useSearchQuery";
import type { Pagination } from "~t/query";

type Filters = Pick<SearchFilters, "family" | "q" | "origin"> & { distinctOrigins?: boolean };

export async function queryTeaType(slug: string, origin: string, withStats: boolean = false) {
	return await (await getApi<TeaType>(`/api/tea_types/${slug}`, { origin, stats: withStats })).json();
}

export async function queryTypesSearch({ distinctOrigins, ...filters }: Filters, pagination: Pagination) {
	const originFilterNodes = filters.origin?.split(".")?.length ?? 1;
	const queryParams = {
		...filters,
		...({ itemsPerPage: 8, ...pagination } satisfies Pagination),
		distinctByLevel: distinctOrigins ? (originFilterNodes > 1 ? 3 : 1) : undefined,
	};

	return await (await getApi<ApiPaginatedCollection<TeaType>>("/tea_types", queryParams)).json();
}

export function makeTeaTypeQueryOpt(type?: Partial<Pick<TeaType, "@id" | "slug">>, origin?: string) {
	const iri = type?.["@id"] ?? `/api/tea_types/${type?.slug}`;

	return queryOptions({
		queryFn: async () => await (await getApi<TeaType>(iri, { origin })).json(),
		queryKey: ["tea_types", iri, { origin }],
		enabled: !!type?.slug || !!type?.["@id"],
	});
}

export function makeTypeSearchInfiniteOpt(filters: Filters, pagination: Pick<Pagination, "itemsPerPage">) {
	return infiniteQueryOptions({
		queryFn: async ({ pageParam }) => {
			if (pageParam) {
				return await (await getApi<ApiPaginatedCollection<TeaType>>(pageParam)).json();
			}

			return await queryTypesSearch(filters, pagination);
		},
		queryKey: ["search", "tea_types", "infinite", filters, pagination],
		staleTime: 60_000,
		getPreviousPageParam: (lastPage) => lastPage.view.previous,
		getNextPageParam: (lastPage) => lastPage.view.next,
		initialPageParam: "",
	});
}
