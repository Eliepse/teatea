import { infiniteQueryOptions } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection } from "~t/types";
import type { Pagination } from "~t/query";
import { denormalizePost, type PostRaw } from "~/utils/api/normalization/post";

export async function queryPosts(filters?: {}, pagination?: Pagination) {
	const queryParams = {
		...filters,
		...({ itemsPerPage: 16, ...pagination } satisfies Pagination),
	};

	const response = await getApi<ApiPaginatedCollection<PostRaw>>("/api/posts", queryParams);
	const payload = await response.json();
	return { ...payload, member: payload.member.map(denormalizePost) };
}

export function makePostInfiniteOpt(filters: {}, pagination?: Pick<Pagination, "itemsPerPage">) {
	return infiniteQueryOptions({
		queryFn: async ({ pageParam }) => {
			if (pageParam) {
				const response = await getApi<ApiPaginatedCollection<PostRaw>>(pageParam);
				const payload = await response.json();
				return { ...payload, member: payload.member.map(denormalizePost) };
			}

			return await queryPosts(filters, pagination);
		},
		queryKey: ["posts", "infinite", filters, pagination],
		staleTime: 60_000,
		getPreviousPageParam: (lastPage) => lastPage.view.previous,
		getNextPageParam: (lastPage) => lastPage.view.next,
		initialPageParam: "",
	});
}
