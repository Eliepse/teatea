import { queryOptions } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { TeaType } from "~t/types";

export function makeTeaTypeQueryOpt(slug?: string, origin?: string) {
	return queryOptions({
		queryFn: async () => await (await getApi<TeaType>(`/api/tea_types/${slug}`, { origin })).json(),
		queryKey: ["tea_types", slug, { origin }],
		enabled: !!slug,
	});
}
