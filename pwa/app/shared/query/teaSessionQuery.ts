import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, Tea } from "~t/types";
import { denormalizeTeaSession, type TeaSessionRaw } from "~/utils/api/normalization/teaSession";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { extractId } from "~/utils/resource";
import type { Pagination } from "~t/query";

export async function querySessionCollectionOfTea(teaId: Tea["id"]) {
	const response = await getApi<ApiPaginatedCollection<TeaSessionRaw>>(`/tea_sessions?tea=${teaId}&itemsPerPage=5`);
	const payload = await response.json();
	return { ...payload, member: payload.member.map(denormalizeTeaSession) };
}

export async function querySessions(filters?: { member	?: string }, pagination?: Pick<Pagination, "itemsPerPage">) {
	const queryParams = {
		...filters,
		...({ itemsPerPage: 16, ...pagination } satisfies Pagination),
	};

	const data = await (await getApi<ApiPaginatedCollection<TeaSessionRaw>>("/api/tea_sessions", queryParams)).json();
	return { ...data, member: data.member.map(denormalizeTeaSession) };
}

export function makeSessionCollectionOfTea(tea: Partial<Pick<Tea, "id" | "@id">>) {
	const id = tea.id ?? extractId(tea["@id"]);

	return queryOptions({
		queryFn: async () => {
			if (!id) {
				throw new Error("[Session collection query] Tea id missing");
			}

			return await querySessionCollectionOfTea(typeof id === "string" ? parseInt(id) : id);
		},
		queryKey: ["tea_sessions", { teaId: id }],
		enabled: !!id,
		staleTime: 15 * 60_000,
	});
}

export function makeSessionInfiniteQueryOpt(
	filters?: { member?: string },
	pagination?: Pick<Pagination, "itemsPerPage">,
) {
	return infiniteQueryOptions({
		queryFn: async ({ pageParam }) => {
			if (pageParam) {
				const data = await (await getApi<ApiPaginatedCollection<TeaSessionRaw>>(pageParam)).json();
				return { ...data, member: data.member.map(denormalizeTeaSession) };
			}

			return await querySessions(filters, pagination);
		},
		queryKey: ["sessions", "infinite", filters, pagination],
		staleTime: 60_000,
		getPreviousPageParam: (lastPage) => lastPage.view.previous,
		getNextPageParam: (lastPage) => lastPage.view.next,
		initialPageParam: "",
	});
}
