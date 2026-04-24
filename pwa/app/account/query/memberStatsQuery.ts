import { queryOptions } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { MemberStats } from "~t/types";

export async function queryMemberStats(username: string) {
	return await (await getApi<MemberStats>(`/members/${username}/stats`)).json();
}

export function makeMemberStatsQueryOpt(username: string) {
	return queryOptions({
		queryFn: async () => await queryMemberStats(username),
		queryKey: ["member", username, "stats"],
	});
}
