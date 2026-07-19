import { infiniteQueryOptions } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection } from "~t/types";
import type { Pagination } from "~t/query";
import { denormalizeFeedItem, type FeedItemRaw } from "~/utils/api/normalization/feedItem";

export async function queryFeed(filters?: {}, pagination?: Pick<Pagination, "itemsPerPage">) {
	const queryParams = {
		...filters,
		...({ itemsPerPage: 16, ...pagination } satisfies Pagination),
	};

	const response = await getApi<ApiPaginatedCollection<FeedItemRaw>>("/api/feed", queryParams);
	const payload = await response.json();
	return { ...payload, member: payload.member.map(denormalizeFeedItem) };
}

export function makeFeedInfiniteOpt(filters?: {}, pagination?: Pick<Pagination, "itemsPerPage">) {
	return infiniteQueryOptions({
		queryFn: async ({ pageParam }) => {
			if (pageParam) {
				const response = await getApi<ApiPaginatedCollection<FeedItemRaw>>(pageParam);
				const payload = await response.json();
				return { ...payload, member: payload.member.map(denormalizeFeedItem) };
			}

			return await queryFeed(filters, pagination);
		},
		queryKey: ["feed", "infinite", filters, pagination],
		staleTime: 60_000,
		getPreviousPageParam: (lastPage) => lastPage.view.previous,
		getNextPageParam: (lastPage) => lastPage.view.next,
		initialPageParam: "",
	});
}
