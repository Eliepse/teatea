import { getApi } from "~/utils/api";
import type { ApiCollection, Friend } from "~t/types";
import { queryOptions } from "@tanstack/react-query";

export async function getFriends(username: string) {
	return await (await getApi<ApiCollection<Friend>>(`/api/members/${username}/friends`)).json();
}
