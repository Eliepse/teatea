import type { ApiCollection, Iri, Origin, OriginWithLeaf } from "~t/types";
import { fetchApi, getApi } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";

type Filters = {
	sort?: "popularity" | "name";
};

export function useOriginByPath(filters?: Filters) {
	return useQuery({
		queryFn: async (ctx) => {
			const queryKey = ctx.queryKey[2] ?? {};
			const filters = typeof queryKey === "string" ? undefined : queryKey;

			const data = await (await getApi<ApiCollection<OriginWithLeaf>>("/origins", filters)).json();
			return Object.fromEntries(data.member.map((origin: OriginWithLeaf) => [origin.path, origin]));
		},
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
