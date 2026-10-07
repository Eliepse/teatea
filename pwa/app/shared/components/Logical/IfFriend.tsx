import { useToken } from "~/auth/hooks/useToken";
import type { Member } from "~t/types";
import type { PropsWithChildren } from "react";

export function IfFriend(
	props: PropsWithChildren<{ member: Pick<Member, "username" | "friendshipped_at">; disallowSelf?: boolean }>,
) {
	const [token] = useToken();

	if (undefined !== props.member.friendshipped_at) {
		return props.children;
	}

	if (true !== props.disallowSelf && token?.username === props.member.username) {
		return props.children;
	}

	return null;
}
