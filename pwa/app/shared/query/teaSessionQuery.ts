import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, Tea } from "~t/types";
import { denormalizeTeaSession, type TeaSessionRaw } from "~/utils/api/normalization/teaSession";
import { queryOptions } from "@tanstack/react-query";
import { extractId } from "~/utils/resource";

export async function querySessionCollectionOfTea(teaId: Tea["id"]) {
	const response = await getApi<ApiPaginatedCollection<TeaSessionRaw>>(
		`/tea_sessions?tea=${teaId}&itemsPerPage=5&contentful=1`,
	);
	const payload = await response.json();
	return { ...payload, member: payload.member.map(denormalizeTeaSession) };
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
