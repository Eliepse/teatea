import { WithMainMenu } from "~/layouts/WithMainMenu";
import { getMember } from "~/shared/query/memberQuery";
import type { Route } from "./+types/friends";
import { getFriends, getFriendships } from "~/account/query/friendsQuery";
import { Link, redirect, useRevalidator } from "react-router";
import { ArrowRight } from "iconoir-react";
import { TokenUtils } from "~/auth/hooks/useToken";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import type { Friendship } from "~t/types";
import { FriendshipDecisionModal } from "~/account/components/FriendshipDecisionModal";
import { BackButton } from "~/components/shared/navigation/BackButton";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const currentUsername = TokenUtils.get()?.username;

	if (params.username !== currentUsername) {
		return redirect(`/members/${currentUsername}`);
	}

	const member = await getMember(params.username);
	const friends = await getFriends(params.username);
	const friendships = await getFriendships(params.username);

	return { member, friends, friendships };
}

export default function friendsPage(props: Route.ComponentProps) {
	const { member, friends, friendships } = props.loaderData;
	const [decideFriendship, setDecideFriendship] = useState<Friendship | undefined>();
	const revalidator = useRevalidator();

	return (
		<WithMainMenu className="bg-green-50">
			<div className="grid grid-cols-3 pt-4 mb-8 px-4">
				<BackButton className="shadow-xs" />

				<span className="text-xl font-medium font-header text-center self-center">
					Friends
					<span className="font-normal font-mono text-stone-600 bg-white rounded-full text-base inline-block px-2 py-1 leading-none ml-2">
						{friends.totalItems}
					</span>
				</span>
			</div>

			<ul className="mb-8 px-4">
				{friends.member.map((friend) => (
					<li key={friend["@id"]}>
						<Link
							className="flex items-center mb-2 px-3 py-3 bg-white rounded-lg shadow-xs"
							to={`/members/${friend.username}`}
						>
							{friend.username}
							<ArrowRight className="ml-auto w-5" />
						</Link>
					</li>
				))}
			</ul>

			{0 !== friendships.member.length && (
				<>
					<h2 className="mb-4">Requests</h2>

					<ul>
						{friendships.member.map((friendship) => (
							<li key={friendship["@id"]}>
								<button
									className="w-full text-left mb-2 px-3 pt-3 pb-2 bg-white rounded-md shadow-xs"
									onClick={() => setDecideFriendship(friendship)}
								>
									<span className="flex items-center">
										{friendship.requestor.username}
										<ArrowRight className="ml-auto w-5" />
									</span>

									{friendship.requestedAt && (
										<span className="text-xs text-stone-600 leading-none mt-1">
											{formatDistanceToNow(friendship.requestedAt)} ago
										</span>
									)}
								</button>
							</li>
						))}
					</ul>
				</>
			)}

			<FriendshipDecisionModal
				friendship={decideFriendship}
				onDecision={() => revalidator.revalidate()}
				onClose={() => setDecideFriendship(undefined)}
			/>
		</WithMainMenu>
	);
}
