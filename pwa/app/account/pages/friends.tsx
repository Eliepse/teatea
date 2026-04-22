import { WithMainMenu } from "~/layouts/WithMainMenu";
import { getMember } from "~/shared/query/memberQuery";
import type { Route } from "./+types/friends";
import { getFriends } from "~/account/query/friendsQuery";
import { Link, redirect } from "react-router";
import { ArrowRight } from "iconoir-react";
import { TokenUtils } from "~/auth/hooks/useToken";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const currentUsername = TokenUtils.get()?.username;

	if (params.username !== currentUsername) {
		return redirect(`/members/${currentUsername}`);
	}

	const member = await getMember(params.username);
	const friends = await getFriends(params.username);

	return { member, friends };
}

export default function friendsPage(props: Route.ComponentProps) {
	const { member, friends } = props.loaderData;

	return (
		<WithMainMenu className="bg-green-50 p-4">
			<div className="flex items-center mb-6">
				<h1 className="flex items-center flex-1 text-3xl font-header font-bold text-green-700">
					Friends
					<span className="font-normal font-mono text-stone-600 bg-white rounded-full text-base inline-block px-2 py-1 leading-none ml-2">
						{friends.totalItems}
					</span>
				</h1>

				{/*<button className="flex-none btn btn-circle bg-white">*/}
				{/*	<UserPlus />*/}
				{/*</button>*/}
			</div>

			<ul>
				{friends.member.map((friend) => (
					<li key={friend["@id"]}>
						<Link
							className="flex items-center mb-2 px-3 py-3 bg-white rounded-md shadow-xs"
							to={`/members/${friend.username}`}
						>
							{friend.username}
							<ArrowRight className="ml-auto w-5" />
						</Link>
					</li>
				))}
			</ul>
		</WithMainMenu>
	);
}
