import { getApi, postApi } from "~/utils/api";
import type { ApiCollection, Friend, Friendship } from "~t/types";
import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { wait } from "~/utils/time";
import { denormalizeFriendship, type FriendshipRaw } from "~/account/query/normalization/friendshipNormalization";

export async function getFriends(username: string) {
	return await (await getApi<ApiCollection<Friend>>(`/api/members/${username}/friends`)).json();
}

export async function getFriendships(username: string) {
	const res = await getApi<ApiCollection<FriendshipRaw>>(`/api/members/${username}/friendships`, {
		status: "pending",
	});
	const data = await res.json();
	return { ...data, member: data.member.map(denormalizeFriendship) };
}

export function friendshipsQueryOpt(username: string) {
	return queryOptions({
		queryFn: async () => await getFriendships(username),
		queryKey: ["members", username, "friendships"],
	});
}

export function requestFriendshipMutationOpt() {
	return mutationOptions({
		mutationFn: async (username: string) => {
			await wait(250); // Slow a bit for a better ux feedback
			return await (await postApi(`/api/members/${username}/friends/request`)).json();
		},
	});
}
