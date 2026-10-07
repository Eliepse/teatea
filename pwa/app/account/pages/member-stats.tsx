import clsx from "clsx";
import { startOfDay, sub } from "date-fns";
import { type PropsWithChildren, useState } from "react";
import { Link, useNavigate } from "react-router";
import { LogOut, PeopleTag, User } from "iconoir-react";
import type { Route } from ".react-router/types/app/account/pages/+types/profile";
import { WithMainMenu } from "~/layouts/WithMainMenu";
import { getApi, postApi } from "~/utils/api";
import { type Member } from "~t/types";
import { TokenUtils, useToken } from "~/auth/hooks/useToken";
import { IfAuthor } from "~/auth/components/voters/IfAuthor";
import { usePopup } from "~/components/shared/modal/AlertManager";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { MemberHistoryChart } from "~/account/components/MemberHistoryChart";
import { MemberFamiliesChart } from "~/account/components/MemberFamiliesChart";
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

	return (
		<WithMainMenu activeKey={isMemberSelf ? "profile" : undefined} className="bg-green-50 text-green-900">
			<div className="grid grid-cols-3 pt-4 mb-2 px-4">
				<BackButton className="shadow-xs" />

				<span className="text-xl font-medium font-header text-center self-center">
					Stats
				</span>
			</div>

			<div className="flex flex-col items-center gap-4 mt-8 mb-4 px-4">
				<h1 className="text-3xl font-header font-bold text-green-700 text-center">
					<PeopleTag className="size-6 block mx-auto mb-1" />
					{member.username}
				</h1>
			</div>

			<IfAuthenticated>
				<div className="grid grid-cols-3 gap-4 mx-4 p-4 mt-1 bg-white rounded-xl text-lg shadow-sm">
					<TopUserStats username={member.username} />

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
		</WithMainMenu>
	);
}
