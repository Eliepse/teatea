import { teaFamilies, type TeaFamily, type TeaType } from "~t/types";
import { fetchApi } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";

async function fetchTypesByFamily(): Promise<{ [key in TeaFamily]: TeaType[] }> {
	const data = await (await fetchApi("/tea_types")).json();
	const groups = Object.fromEntries(Object.keys(teaFamilies).map((key) => [key, []]));
	return data.member.reduce((groups, type) => {
		groups[type.family as TeaFamily].push(type);
		return groups;
	}, groups);
}

export function useTeaTypes() {
	return useQuery({
		queryFn: fetchTypesByFamily,
		queryKey: ["tea_types"]
	});
}
