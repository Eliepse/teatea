import clsx from "clsx";
import { startOfDay, sub } from "date-fns";
import { type PropsWithChildren, useState } from "react";
import { Link, useNavigate } from "react-router";
import { CoffeeCup, Leaf, LogOut, PeopleTag, User } from "iconoir-react";
import type { Route } from ".react-router/types/app/account/pages/+types/profile";
import { WithMainMenu } from "~/layouts/WithMainMenu";
import { getApi, postApi } from "~/utils/api";
import { type Member } from "~t/types";
import { TokenUtils, useToken } from "~/auth/hooks/useToken";
import { IfAuthor } from "~/auth/components/voters/IfAuthor";
import { usePopup } from "~/components/shared/modal/AlertManager";
import { UserStat } from "~/components/stats/UserStat";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { MemberHistoryChart } from "~/account/components/MemberHistoryChart";
import { MemberFamiliesChart } from "~/account/components/MemberFamiliesChart";
import { MemberQRCodeBtn } from "~/account/components/MemberQRCodeBtn";
import { useQuery } from "@tanstack/react-query";
import { makeMemberStatsQueryOpt } from "~/account/query/memberStatsQuery";
import { IfAuthenticated } from "~/auth/components/voters/IfAuthenticated";
import { FriendTag, getFriendshipStatus } from "~/account/components/FriendTag";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const username = args.params.username;
	const request = await getApi<Member>(`/members/${username}`);
	return { member: await request.json() };
}

function getSince(interval: "30d" | "6m"): Date {
	if ("30d" === interval) {
		return startOfDay(sub(new Date(), { days: 30 }));
	}

	return startOfDay(sub(new Date(), { months: 6 }));
}

export default function ProfilePage(props: Route.ComponentProps) {
	const { member } = props.loaderData;
	const [token] = useToken();
	const navigate = useNavigate();
	const popup = usePopup();
	const [statsInterval, setStatsInterval] = useState<"30d" | "6m">("30d");
	const statsSince = getSince(statsInterval);
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
		<WithMainMenu activeKey={isMemberSelf ? "profile" : undefined} className="bg-green-50 px-4 text-green-900">
			<div className="flex items-center pt-4 mb-2">
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

			<div className="flex flex-col items-center gap-4 mb-4">
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
				<div className="grid grid-cols-3 gap-4 p-4 mt-1 bg-white rounded-xl text-lg shadow-sm">
					<Stats username={member.username} isSelf={isMemberSelf} />

					<IfFriend member={member}>
						<hr className="border-stone-200 col-span-3" />

						<div className="col-span-3 flex rounded text-green-700 border border-green-600 text-base mb-4">
							<button
								className={clsx(
									"flex-1 py-2 rounded cursor-pointer",
									"30d" === statsInterval ? "bg-green-600 text-white" : "hover:bg-green-100",
								)}
								onClick={() => setStatsInterval("30d")}
							>
								30 days
							</button>
							<button
								className={clsx(
									"flex-1 py-2 rounded cursor-pointer",
									"6m" === statsInterval ? "bg-green-600 text-white" : "hover:bg-green-100",
								)}
								onClick={() => setStatsInterval("6m")}
							>
								6 months
							</button>
						</div>

						<MemberFamiliesChart memberIri={member["@id"]} since={statsSince} className="col-span-3 mb-4" />
						<MemberHistoryChart memberIri={member["@id"]} since={statsSince} className="col-span-3" />
					</IfFriend>
				</div>
			</IfAuthenticated>

			<IfAuthor author={member}>
				<Link
					to={`/members/${member.username}/friends`}
					className="flex items-center bg-white text-green-900 rounded-xl px-6 h-16 text-lg shadow-sm my-4"
				>
					Friends
					<User className="ml-auto size-6" />
				</Link>
			</IfAuthor>
		</WithMainMenu>
	);
}

function Stats(props: { username: Member["username"]; isSelf: boolean }) {
	const { data, isLoading } = useQuery(makeMemberStatsQueryOpt(props.username));
	const leavesKg = data?.statsConsumedTeaKgTotal ?? 0;

	const tastedTeasComp = (
		<UserStat
			title="tasted teas"
			value={data?.statsConsumedTeasTotal ?? 0}
			icon={<Leaf className="size-5 inline mx-1" />}
			withArrow={props.isSelf}
			loading={isLoading}
		/>
	);

	return (
		<>
			<Link to={`/sessions?username=${props.username}`}>
				<UserStat
					title="tea sessions"
					value={data?.statsSessionsTotal ?? 0}
					icon={<CoffeeCup className="size-5 inline mx-1" />}
					withArrow
					loading={isLoading}
				/>
			</Link>

			{props.isSelf ? <Link to="/me/teas">{tastedTeasComp}</Link> : tastedTeasComp}

			<UserStat
				title="brewed leaves"
				value={leavesKg > 1 ? leavesKg.toFixed(2) : leavesKg * 1000}
				icon={<span className="text-lg font-normal mx-1">{leavesKg > 1 ? "kg" : "g"}</span>}
				loading={isLoading}
			/>
		</>
	);
}

function IfFriend(props: PropsWithChildren<{ member: Member }>) {
	const [token] = useToken();
	return props.member.friendshipped_at || token?.username === props.member.username ? props.children : null;
}
