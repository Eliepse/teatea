import type { ApiPaginatedCollection, Business } from "~t/types";
import { getApi } from "~/utils/api";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import type { Pagination } from "~t/query";

export async function queryBusiness(iri: Business["@id"]) {
	return await (await getApi<Business>(iri)).json();
}

export async function queryBusinesses(filters?: { q?: string }, pagination?: Pagination) {
	const queryParams = {
		...filters,
		...({ itemsPerPage: 8, ...pagination } satisfies Pagination),
	};

	return await (await getApi<ApiPaginatedCollection<Business>>("/api/businesses", queryParams)).json();
}

export function makeBusinessQueryOpt(business?: Partial<Pick<Business, "@id" | "id">>) {
	const iri = business?.["@id"];

	return queryOptions({
		queryFn: async () => {
			if (!iri && !business?.id) {
				return null;
			}

			return await queryBusiness(iri ?? `/businesses/${business.id}`);
		},
		queryKey: [iri],
		staleTime: 60 * 60_000,
		enabled: !!iri || !!business?.id,
	});
}

export function makeBusinessInfiniteOpt(filters: { q?: string }, pagination?: Pick<Pagination, "itemsPerPage">) {
	return infiniteQueryOptions({
		queryFn: async ({ pageParam }) => {
			if (pageParam) {
				return await (await getApi<ApiPaginatedCollection<Business>>(pageParam)).json();
			}

			return await queryBusinesses(filters, pagination);
		},
		queryKey: ["search", "business", "infinite", filters, pagination],
		staleTime: 60_000,
		getPreviousPageParam: (lastPage) => lastPage.view.previous,
		getNextPageParam: (lastPage) => lastPage.view.next,
		initialPageParam: "",
	});
}
