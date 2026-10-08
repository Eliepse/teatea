import { startOfDay, sub } from "date-fns";
import { Link, useNavigate } from "react-router";
import { LogOut, NavArrowRight, PeopleTag, User } from "iconoir-react";
import type { Route } from ".react-router/types/app/account/pages/+types/profile";
import { WithMainMenu } from "~/layouts/WithMainMenu";
import { getApi, postApi } from "~/utils/api";
import { type Member } from "~t/types";
import { TokenUtils, useToken } from "~/auth/hooks/useToken";
import { IfAuthor } from "~/auth/components/voters/IfAuthor";
import { usePopup } from "~/components/shared/modal/AlertManager";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { MemberQRCodeBtn } from "~/account/components/MemberQRCodeBtn";
import { IfAuthenticated } from "~/auth/components/voters/IfAuthenticated";
import { FriendTag, getFriendshipStatus } from "~/account/components/FriendTag";
import { FeedStream } from "~/social/components/Feed/FeedStream";
import { TopUserStats } from "~/account/components/Stats/TopUserStats";
import { IfFriend } from "~/shared/components/Logical/IfFriend";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const username = args.params.username;
	const request = await getApi<Member>(`/members/${username}`);
	return { member: await request.json() };
}

export default function ProfilePage(props: Route.ComponentProps) {
	const { member } = props.loaderData;
	const [token] = useToken();
	const navigate = useNavigate();
	const popup = usePopup();
	const isMemberSelf = member.username === token?.username;

	function promptLogout() {
		popup.confirm({ body: "Do you want to logout?" }).then(() => {
			postApi("/logout", { refresh_token: TokenUtils.getRefreshToken() })
				.then(() => {
					TokenUtils.clear();
					navigate("/");
				})
				.catch((e) => popup.alert({ title: "Failed to logout", body: e.message }));
		});
	}

	return (
		<WithMainMenu activeKey={isMemberSelf ? "profile" : undefined} className="bg-green-50 text-green-900">
			<div className="flex items-center pt-4 mb-2 px-4">
				<BackButton className="shadow-xs" />

				<IfAuthor author={member}>
					<MemberQRCodeBtn username={member.username} />
				</IfAuthor>

				<IfAuthor author={member}>
					<button className="btn btn-lg btn-circle bg-white ml-2 shadow-xs" onClick={promptLogout}>
						<LogOut className="size-5" />
					</button>
				</IfAuthor>
			</div>

			<div className="flex flex-col items-center gap-4 mb-4 px-4">
				<h1 className="text-3xl font-header font-bold text-green-700 text-center">
					<PeopleTag className="size-6 block mx-auto mb-1" />
					{member.username}
				</h1>

				<ul className="text-green-900 text-sm flex gap-1 leading-normal select-none">
					<IfAuthenticated>
						{!member.friendship_rejected && member.username !== token?.username && (
							<li>
								<FriendTag status={getFriendshipStatus(member)} username={member.username} />
							</li>
						)}
					</IfAuthenticated>
				</ul>
			</div>

			<IfAuthenticated>
				<div
					className="grid grid-cols-3 gap-4 mx-4 p-4 mt-1 mb-4 bg-white rounded-xl text-lg shadow-sm"
					onClick={() => navigate(`/members/${member.username}/stats`)}
				>
					<TopUserStats username={member.username} />

					<IfFriend member={member}>
						<hr className="col-span-3 border-stone-200" />
						<div className="text-xs col-span-3 text-stone-500 flex items-center justify-end">
							More details
							<NavArrowRight className="size-3 inline-block ml-1 relative" />
						</div>
					</IfFriend>
				</div>
			</IfAuthenticated>

			<IfAuthor author={member}>
				<Link
					to={`/members/${member.username}/friends`}
					className="flex items-center bg-white text-green-900 rounded-xl px-6 h-16 text-lg shadow-sm my-4 mx-4"
				>
					Friends
					<User className="ml-auto size-6" />
				</Link>
			</IfAuthor>

			<FeedStream filters={{ username: member.username }} />
		</WithMainMenu>
	);
}
