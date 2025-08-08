import { type ApiCollection, type TeaFamily, type TeaType } from "~t/types";
import { fetchApi } from "~/utils/api";
import { type QueryFunctionContext, useQuery } from "@tanstack/react-query";

type TeaTypesFilters = {
	originPath?: string;
	family?: TeaFamily;
};

async function fetchTypesByFamily(args: QueryFunctionContext<[string, TeaTypesFilters]>) {
	const filters = args.queryKey[1] ?? {};
	const searchParams = new URLSearchParams();

	if (filters.originPath) {
		searchParams.append("originPath", filters.originPath);
	}

	if (filters.family) {
		searchParams.append("family", filters.family);
	}

	const params = searchParams.size ? `?${searchParams}` : "";
	return await (await fetchApi<ApiCollection<TeaType>>(`/tea_types${params}`)).json();
}

export function useTeaTypes(filters?: TeaTypesFilters) {
	return useQuery({
		queryFn: fetchTypesByFamily,
		queryKey: ["tea_types", filters ?? {}],
	});
}
