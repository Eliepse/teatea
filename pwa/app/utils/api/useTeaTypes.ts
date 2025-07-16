import { teaFamilies, type TeaFamily, type TeaType } from "~t/types";
import { fetchApi } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";

async function fetchTypesByFamily(args: {
	queryKey: [string, number | undefined];
}): Promise<{ [key in TeaFamily]: TeaType[] }> {
	const originId = args.queryKey[1] ?? undefined;

	const data = await (await fetchApi(originId ? `/origins/${originId}/tea_types` : "/tea_types")).json();
	const groups = Object.fromEntries(Object.keys(teaFamilies).map((key) => [key, []]));
	return data.member.reduce((groups, type) => {
		groups[type.family as TeaFamily].push(type);
		return groups;
	}, groups);
}

export function useTeaTypes(originId?: number) {
	return useQuery({
		queryFn: fetchTypesByFamily,
		queryKey: ["tea_types", originId],
	});
}
