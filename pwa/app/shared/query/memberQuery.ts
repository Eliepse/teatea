import type { Member } from "~t/types";
import { getApi } from "~/utils/api";

export async function getMember(username: string) {
	return await (await getApi<Member>(`/api/members/${username}`)).json();
}
