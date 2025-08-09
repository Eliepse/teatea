import type { ApiCollection, Iri, Origin } from "~t/types";
import { fetchApi } from "~/utils/api";
import { type QueryFunctionContext, useQuery } from "@tanstack/react-query";

type Filters = {};

async function fetchOriginsKeyByPath(
	ctx: QueryFunctionContext<[string, string, Filters | undefined]>,
): Promise<{ [key: string]: Origin }> {
	const filters = ctx.queryKey[2];
	const data = await (await fetchApi<ApiCollection<Origin>>("/origins", { payload: filters })).json();
	return Object.fromEntries(data.member.map((origin: Origin) => [origin.path.join("."), origin]));
}

export function useOriginByPath(filters?: Filters) {
	return useQuery({
		queryFn: fetchOriginsKeyByPath,
		queryKey: ["origins", "keyByPath", filters],
	});
}

export function useOrigin(id: Iri | number | null | undefined) {
	const key = typeof id === "string" ? parseInt(id.split("/").slice(-1)[0]) : id;
	return useQuery({
		queryFn: async () => {
			if (!key) {
				return null;
			}

			return await (await fetchApi<Origin>(`/origins/${key}`)).json();
		},
		queryKey: ["origins", key],
	});
}
