import { type Id, type TeaFamily, type TeaType } from "~t/types";
import { fetchApi } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";

type TeaTypesFilters = {
	origin?: Id;
	family?: TeaFamily;
};

async function fetchTypesByFamily(args: {
	queryKey: [string, TeaTypesFilters];
}): Promise<{ [key in TeaFamily]: TeaType[] }> {
	const originId = args.queryKey[1] ?? undefined;

	return await (await fetchApi(originId ? `/origins/${originId}/tea_types` : "/tea_types")).json();
}

export function useTeaTypes(filters?: TeaTypesFilters) {
	return useQuery({
		queryFn: fetchTypesByFamily,
		queryKey: ["tea_types", filters ?? {}],
	});
}
