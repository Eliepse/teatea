import type { Iri, Tea, TeaSession } from "~t/types";
import { queryOptions } from "@tanstack/react-query";
import { fetchApi } from "~/utils/api";
import { denormalizeTeaSession, type TeaSessionRaw } from "~/utils/api/normalization/teaSession";

export async function queryTeaSession(id: number) {
	const response = await fetchApi<TeaSessionRaw>(`/tea_sessions/${id}`);
	return denormalizeTeaSession(await response.json()) as TeaSession & {
		author: Iri;
		tea: Tea & { type: Iri };
	};
}

export function makeTeaSessionQueryOpt(id: number) {
	return queryOptions({
		queryFn: async () => queryTeaSession(id),
		queryKey: ["TeaSession", id],
	});
}
