import { queryOptions } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { Cultivar } from "~t/types";

export function makeCultivarQueryOpt(cultivar?: Partial<Pick<Cultivar, "@id" | "id">>) {
	const iri = cultivar?.["@id"] ?? `/cultivars/${cultivar?.id}`;

	return queryOptions({
		queryFn: async () => await (await getApi<Cultivar>(iri)).json(),
		queryKey: ["cultivars", iri],
		staleTime: 7 * 24 * 60_000,
		enabled: !!cultivar?.["@id"] || !!cultivar?.id,
	});
}
