import type { ApiCollection, Iri, Origin, TreePath } from "~t/types";
import { fetchApi, getApi } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";

type Filters = {
	parent?: string;
	level?: number;
	sort?: "popularity" | "name";
};

export function useOriginByPath(filters?: Filters) {
	return useQuery({
		queryFn: async (ctx) => {
			const queryKey = ctx.queryKey[2] ?? {};
			const filters = typeof queryKey === "string" ? undefined : queryKey;

			const data = await (await getApi<ApiCollection<Origin>>("/origins", filters)).json();
			return Object.fromEntries(data.member.map((origin) => [origin.path, origin]));
		},
		queryKey: ["origins", "keyByPath", filters],
	});
}

export function useOrigin(path: Iri | TreePath | null | undefined) {
	return useQuery({
		queryFn: async (ctx) => {
			const key = ctx.queryKey[1];

			if (typeof key !== "string") {
				return null;
			}

			// As an Iri
			if (key.includes("/")) {
				return await (await fetchApi<Origin>(key)).json();
			}

			// As a path
			return await (await fetchApi<Origin>(`/origins/${key}`)).json();
		},
		queryKey: ["origins", path],
		enabled: !!path,
	});
}

export function getParentPath(path?: TreePath): TreePath | undefined {
	if (undefined === path) {
		return undefined;
	}

	const parentNodes = path.split(".").slice(0, -1);

	return 0 !== parentNodes.length ? parentNodes.join(".") : undefined;
}
