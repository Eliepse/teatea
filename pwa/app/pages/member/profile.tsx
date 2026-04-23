import { WithMainMenu } from "~/layouts/WithMainMenu";
import type { Route } from "../../../.react-router/types/app/pages/member/+types/profile";
import { getApi, postApi } from "~/utils/api";
import { type Member, type MemberStats } from "~t/types";
import { usePopup } from "~/components/shared/modal/AlertManager";
import { TokenUtils, useToken } from "~/auth/hooks/useToken";
import { Link, useNavigate } from "react-router";
import { CoffeeCup, Leaf, LogOut, PeopleTag, QrCode, User } from "iconoir-react";
import { UserStat } from "~/components/stats/UserStat";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { IfAuthor } from "~/auth/components/voters/IfAuthor";
import { MemberHistoryChart } from "~/pages/member/_components/MemberHistoryChart";
import { MemberFamiliesChart } from "~/pages/member/_components/MemberFamiliesChart";
import { useState } from "react";
import clsx from "clsx";
import { startOfDay, sub } from "date-fns";
import { Modal } from "~/components/shared/modal/Modal";
import { MemberQRCodeBtn } from "~/account/components/MemberQRCodeBtn";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const username = args.params.username;

	const requests = await Promise.all([
		await getApi<Member>(`/members/${username}`),
		await getApi<MemberStats>(`/members/${username}/stats`),
	]);

	const member = await requests[0].json();
	const stats = await requests[1].json();
	return { member, stats };
}

function getSince(interval: "30d" | "6m"): Date {
	if ("30d" === interval) {
		return startOfDay(sub(new Date(), { days: 30 }));
	}

	return startOfDay(sub(new Date(), { months: 6 }));
}

export default function ProfilePage(props: Route.ComponentProps) {
	const { member, stats } = props.loaderData;
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
		<WithMainMenu className="bg-green-50 px-4 text-green-900">
			<div className="flex items-center pt-4 mb-4">
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

			<h1 className="text-3xl font-header font-bold text-green-700 mb-4">
				<PeopleTag className="size-6 inline-block mr-2 relative bottom-0.5" />
				{member.username}
			</h1>

			{!stats.statsSessionsTotal && (
				<div className="flex items-center justify-center px-4 min-h-24 bg-white rounded-xl text-lg shadow-sm">
					<span className="text-green-800/60 col-span-2">
						Looks like you haven&apos;t drink tea yet <Leaf className="size-5 inline" />
					</span>
				</div>
			)}

			<div className="grid grid-cols-3 gap-4 p-4 mt-1 bg-white rounded-xl text-lg shadow-sm">
				<Stats
					sessions={stats.statsSessionsTotal}
					teas={stats.statsConsumedTeasTotal}
					leavesKg={stats.statsConsumedTeaKgTotal}
					username={member.username}
					isSelf={isMemberSelf}
				/>

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

				<MemberFamiliesChart memberIri={member["@id"]} since={statsSince} className="col-span-3 mx-8 mb-6" />
				<MemberHistoryChart memberIri={member["@id"]} since={statsSince} className="col-span-3" />
			</div>

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

function Stats(props: { sessions: number; teas: number; leavesKg: number; username?: string; isSelf: boolean }) {
	if (!props.sessions) {
		return null;
	}

	const tastedTeasComp = (
		<UserStat
			title="tasted teas"
			value={props.teas}
			icon={<Leaf className="size-5 inline mx-1" />}
			withArrow={props.isSelf}
		/>
	);

	return (
		<>
			<Link to={`/sessions?username=${props.username}`}>
				<UserStat
					title="tea sessions"
					value={props.sessions}
					icon={<CoffeeCup className="size-5 inline mx-1" />}
					withArrow
				/>
			</Link>

			{props.isSelf ? <Link to="/me/teas">{tastedTeasComp}</Link> : tastedTeasComp}

			<UserStat
				title="brewed leaves"
				value={props.leavesKg > 1 ? props.leavesKg.toFixed(2) : props.leavesKg * 1000}
				icon={<span className="text-lg font-normal mx-1">{props.leavesKg > 1 ? "kg" : "g"}</span>}
			/>
		</>
	);
}
