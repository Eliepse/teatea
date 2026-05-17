import { queryOptions } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { TeaType } from "~t/types";

export async function queryTeaType(slug: string, origin: string, withStats: boolean = false) {
	return await (await getApi<TeaType>(`/api/tea_types/${slug}`, { origin, stats: withStats })).json();
}

export function makeTeaTypeQueryOpt(type?: Partial<Pick<TeaType, "@id" | "slug">>, origin?: string) {
	const iri = type?.["@id"] ?? `/api/tea_types/${type?.slug}`;

	return queryOptions({
		queryFn: async () => await (await getApi<TeaType>(iri, { origin })).json(),
		queryKey: ["tea_types", iri, { origin }],
		enabled: !!type?.slug || !!type?.["@id"],
	});
}
