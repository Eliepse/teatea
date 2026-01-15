import { AuthLayout } from "~/layouts/AuthLayout";
import type { Route } from "../../../.react-router/types/app/pages/member/+types/profile";
import { getApi, postApi } from "~/utils/api";
import type { Member, MemberStats, TeaFamily } from "~t/types";
import { usePopup } from "~/components/shared/modal/AlertManager";
import { TokenUtils, useToken } from "~/auth/hooks/useToken";
import { Link, useNavigate } from "react-router";
import { CoffeeCup, Leaf, LogOut, PeopleTag } from "iconoir-react";
import { UserStat } from "~/components/stats/UserStat";
import { BackButton } from "~/components/shared/navigation/BackButton";
import clsx from "clsx";

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

export default function ProfilePage(props: Route.ComponentProps) {
	const { member, stats } = props.loaderData;
	const [token] = useToken();
	const navigate = useNavigate();
	const popup = usePopup();
	const isMemberSelf = member.username === token?.username;
	const familiesStats = Object.fromEntries(stats.statsFamilies.map((item) => [item.family, item.sessions])) as Record<
		TeaFamily,
		number
	>;

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
		<AuthLayout className="bg-green-50 px-4">
			<div className="flex items-center pt-4 mb-4">
				<BackButton className="shadow-xs" />
				<button className="btn btn-lg btn-circle bg-white ml-auto shadow-xs" onClick={promptLogout}>
					<LogOut className="size-4" />
				</button>
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

			<Stats
				sessions={stats.statsSessionsTotal}
				teas={stats.statsConsumedTeasTotal}
				username={isMemberSelf ? token?.username : undefined}
				familiesStats={familiesStats}
			/>
		</AuthLayout>
	);
}

const teaFamilyColor = {
	yellow: "bg-lime-600",
	white: "bg-cyan-400",
	green: "bg-green-600",
	wulong: "bg-indigo-600",
	black: "bg-orange-600",
	fermented: "bg-stone-600",
} as const;

function Stats(props: { sessions: number; teas: number; username?: string; familiesStats: Record<TeaFamily, number> }) {
	if (!props.sessions) {
		return null;
	}

	console.debug(props.familiesStats);
	const totalFamiliesSessions = Object.values(props.familiesStats).reduce((c, i) => i + c, 0);
	const tastedTeasComp = (
		<UserStat
			title="tasted teas"
			value={props.teas}
			icon={<Leaf className="size-5 inline mx-1" />}
			withArrow={!!props.username}
		/>
	);

	return (
		<div className="grid grid-cols-2 gap-4 px-4 py-4 mt-1 bg-white rounded-xl text-lg shadow-sm">
			<div className="col-span-2 flex justify-stretch h-6 rounded overflow-hidden text-sm text-white">
				{Object.entries(props.familiesStats).map(([family, count]) => {
					const percent = Math.round((count * 100) / totalFamiliesSessions);
					return (
						<span
							className={clsx("inline-flex justify-center items-center h-full", teaFamilyColor[family])}
							style={{ width: percent + "%" }}
						>
							{percent >= 8 ? <>{percent.toFixed(0)} %</> : null}
						</span>
					);
				})}
			</div>

			<Link to={`/sessions?username=${props.username}`}>
				<UserStat
					title="tea sessions"
					value={props.sessions}
					icon={<CoffeeCup className="size-5 inline mx-1" />}
					withArrow
				/>
			</Link>

			{props.username ? <Link to="/me/teas">{tastedTeasComp}</Link> : tastedTeasComp}
		</div>
	);
}
