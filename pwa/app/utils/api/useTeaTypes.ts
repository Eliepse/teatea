import { type ApiCollection, type Id, type TeaFamily, type TeaType } from "~t/types";
import { fetchApi } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";

type TeaTypesFilters = {
	origin?: Id;
	family?: TeaFamily;
};

async function fetchTypesByFamily(args: { queryKey: [string, TeaTypesFilters] }): Promise<ApiCollection<TeaType>> {
	const filters = args.queryKey[1] ?? {};
	const searchParams = new URLSearchParams();

	if (filters.origin) {
		searchParams.append("origin", filters.origin.toFixed(0));
	}

	if (filters.family) {
		searchParams.append("family", filters.family);
	}

	const params = searchParams.size ? `?${searchParams}` : "";
	return await (await fetchApi(`/tea_types${params}`)).json();
}

export function useTeaTypes(filters?: TeaTypesFilters) {
	return useQuery({
		queryFn: fetchTypesByFamily,
		queryKey: ["tea_types", filters ?? {}],
	});
}
