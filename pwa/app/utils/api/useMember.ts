import type { Iri, Member } from "~t/types";
import { getApi } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";

export function useMember(filters: { iri?: Iri; username?: string }) {
	const iri = filters.iri ? filters.iri : `/api/members/${filters.username}`;
	return useQuery({
		queryFn: async (ctx) => await (await getApi<Member>(ctx.queryKey[0])).json(),
		queryKey: [iri],
		enabled: !!filters.iri || !!filters.username,
	});
}
