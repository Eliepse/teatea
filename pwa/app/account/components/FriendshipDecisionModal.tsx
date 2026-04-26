import { Modal } from "~/components/shared/modal/Modal";
import type { Friendship } from "~t/types";
import { useMutation } from "@tanstack/react-query";
import { decideFriendshiptMutationOpt } from "~/account/query/friendsQuery";
import { useAlert } from "~/components/shared/modal/AlertManager";
import clsx from "clsx";

export function FriendshipDecisionModal(props: { friendship?: Friendship; onDecision: () => void; onClose: () => void }) {
	const alertModal = useAlert();
	const mutation = useMutation({
		...decideFriendshiptMutationOpt(props.friendship?.id),
		onSuccess: (_, opt) => {
			const decision = "accept" === opt ? "accepted" : "rejected";
			alertModal({ body: `Friendship ${decision}!` });
			props.onDecision();
			props.onClose();
		},
		onError: () => alertModal({ body: "Error while replying to the friendship request" }),
	});

	return (
		<Modal open={undefined !== props.friendship} onClose={props.onClose} className="p-4">
			<p className="text-center text-green-900 my-4 mb-8 leading-normal">
				<span className="text-3xl font-header font-bold block mb-3">
					{props.friendship?.requestor?.username}
				</span>
				would like to be your tea friend
			</p>

			<button
				className={clsx(
					"block w-full my-3 p-3 rounded-lg",
					mutation.isPending ? "bg-stone-200" : "text-white bg-green-600 active:bg-green-700",
				)}
				onClick={() => mutation.mutate("accept")}
				disabled={mutation.isPending}
			>
				Accept
			</button>

			<button
				className={clsx(
					"block w-full my-3 p-3 border rounded-lg",
					mutation.isPending ? "border-stone-200" : "border-red-600 text-red-700 active:bg-red-200",
				)}
				onClick={() => mutation.mutate("reject")}
				disabled={mutation.isPending}
			>
				Reject
			</button>
		</Modal>
	);
}
