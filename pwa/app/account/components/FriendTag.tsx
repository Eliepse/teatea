import { UserLove, UserPlus } from "iconoir-react";
import type { Member } from "~t/types";
import { useMutation } from "@tanstack/react-query";
import { requestFriendshipMutationOpt } from "~/account/query/friendsQuery";
import clsx from "clsx";
import { ShortInfoModal } from "~/shared/components/ShortInfoModal";
import { useState } from "react";
import { useAlert } from "~/components/shared/modal/AlertManager";

type Status = "add" | "waiting" | "accepted";

export function FriendTag(props: { status: Status; username?: string }) {
	const username = props.username;
	const [open, setOpen] = useState(false);
	const alerter = useAlert();
	const mutation = useMutation({
		...requestFriendshipMutationOpt(),
		onSuccess: () => setOpen(true),
		onError: () => alerter({ body: `Unable to send friend request to @${username}` }),
	});

	if (mutation.isPending) {
		return (
			<div className="flex items-center justify-center px-2 py-1  bg-green-200 rounded-xl animate-pulse">
				<UserLove className="size-4 mr-1" />
				Sending request...
			</div>
		);
	}

	if ("accepted" === props.status) {
		return (
			<div className="flex items-center justify-center px-2 py-1  bg-white rounded-xl">
				<UserLove className="size-4 mr-1" />
				Friend
			</div>
		);
	}

	if ("waiting" === props.status || mutation.isSuccess) {
		return (
			<>
				<div className="flex items-center justify-center px-2 py-1  bg-white rounded-xl text-stone-400">
					<UserLove className="size-4 mr-1" />
					Waiting reply
				</div>
				{/* TODO(elie): use a global version with a hook or something */}
				<ShortInfoModal open={open} onClose={() => setOpen(false)}>
					<p className="text-xl text-center text-green-800">Friendship request sent to @{props.username}!</p>
				</ShortInfoModal>
			</>
		);
	}

	if (username && ("add" === props.status || mutation.isError)) {
		return (
			<button
				className={clsx(
					"flex items-center justify-center px-2 py-1  bg-white rounded-xl",
					"cursor-pointer hover:bg-green-200 active:bg-green-400",
				)}
				onClick={() => mutation.mutate(username)}
			>
				<UserPlus className="size-4 mr-1" />
				Add friend
			</button>
		);
	}

	return null;
}

export function getFriendshipStatus(
	member: Pick<Member, "friendship_rejected" | "friendship_requested" | "friendshipped_at">,
): Status {
	if (member.friendship_rejected) {
		return "add";
	}

	if (member.friendshipped_at) {
		return "accepted";
	}

	if (member.friendship_requested) {
		return "waiting";
	}

	return "add";
}
