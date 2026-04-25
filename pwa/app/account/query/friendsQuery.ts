import { getApi, postApi } from "~/utils/api";
import type { ApiCollection, Friend } from "~t/types";
import { mutationOptions } from "@tanstack/react-query";
import { wait } from "~/utils/time";

export async function getFriends(username: string) {
	return await (await getApi<ApiCollection<Friend>>(`/api/members/${username}/friends`)).json();
}

export function requestFriendshipMutationOpt() {
	return mutationOptions({
		mutationFn: async (username: string) => {
			await wait(250); // Slow a bit for a better ux feedback
			return await (await postApi(`/api/members/${username}/friends/request`)).json();
		},
	});
}
