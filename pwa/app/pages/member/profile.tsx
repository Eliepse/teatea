import { AuthLayout } from "~/layouts/AuthLayout";
import type { Route } from "../../../.react-router/types/app/pages/member/+types/profile";
import { getApi, postApi } from "~/utils/api";
import { type Member, type MemberStats, teaFamilies, type TeaFamily } from "~t/types";
import { usePopup } from "~/components/shared/modal/AlertManager";
import { TokenUtils, useToken } from "~/auth/hooks/useToken";
import { Link, useNavigate } from "react-router";
import { CoffeeCup, Leaf, LogOut, PeopleTag } from "iconoir-react";
import { UserStat } from "~/components/stats/UserStat";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { IfAuthor } from "~/auth/components/voters/IfAuthor";
import { useQuery } from "@tanstack/react-query";
import { MemberTeaFamiliesChart } from "~/pages/member/_components/MemberTeaFamiliesChart";

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
		<AuthLayout className="bg-green-50 px-4 text-green-900">
			<div className="flex items-center pt-4 mb-4">
				<BackButton className="shadow-xs" />

				<IfAuthor author={member}>
					<button className="btn btn-lg btn-circle bg-white ml-auto shadow-xs" onClick={promptLogout}>
						<LogOut className="size-4" />
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

			<Stats
				sessions={stats.statsSessionsTotal}
				teas={stats.statsConsumedTeasTotal}
				leavesKg={stats.statsConsumedTeaKgTotal}
				username={member.username}
				isSelf={isMemberSelf}
				familiesStats={familiesStats}
			/>

			<section className="p-4 pl-2 pr-3 mt-4 bg-white rounded-xl text-lg shadow-sm">
				<h2 className="mb-2 text-xs font-bold text-stone-400 uppercase tracking-wide">Last 6 months</h2>
				<MemberTeaFamiliesChart memberIri={member["@id"]} />
			</section>
		</AuthLayout>
	);
}

function Stats(props: {
	sessions: number;
	teas: number;
	leavesKg: number;
	username?: string;
	familiesStats: Record<TeaFamily, number>;
	isSelf: boolean;
}) {
	if (!props.sessions) {
		return null;
	}

	const subject = props.isSelf ? "You" : props.username;
	const totalFamiliesSessions = Object.values(props.familiesStats).reduce((c, i) => i + c, 0);
	const families = Object.keys(teaFamilies)
		.map((family) => {
			const sessions = totalFamiliesSessions ? (props.familiesStats[family as TeaFamily] ?? 0) : 0;
			return [family as TeaFamily, { sessions, ratio: sessions / totalFamiliesSessions }] as const;
		})
		.filter((a) => a[1].sessions)
		.sort((a, b) => b[1].sessions - a[1].sessions);

	const tastedTeasComp = (
		<UserStat
			title="tasted teas"
			value={props.teas}
			icon={<Leaf className="size-5 inline mx-1" />}
			withArrow={props.isSelf}
		/>
	);

	return (
		<div className="grid grid-cols-3 gap-4 p-4 mt-1 bg-white rounded-xl text-lg shadow-sm">
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

			<hr className="border-stone-200 col-span-3" />

			<div className="col-span-3">
				<h2 className="mb-2 text-xs font-bold text-stone-400 uppercase tracking-wide">Last 30 days</h2>
				{0 === families.length && <p>{subject} didn't drink tea recently.</p>}
				{1 === families.length && (
					<p>
						{subject} only drank <strong>{teaFamilies[families[0][0]]}</strong> ({families[0][1].sessions}{" "}
						sessions).
					</p>
				)}
				{1 < families.length && (
					<p>
						{subject} drank{" "}
						<TeaStatInline
							family={families[0][0]}
							sessions={families[0][1].sessions}
							ratio={families[0][1].ratio}
						/>{" "}
						and{" "}
						<TeaStatInline
							family={families[1][0]}
							sessions={families[1][1].sessions}
							ratio={families[1][1].ratio}
						/>
						.{" "}
						{3 <= families.length && (
							<>
								{subject} also drank{" "}
								<TeaStatInline
									family={families[2][0]}
									sessions={families[2][1].sessions}
									ratio={families[2][1].ratio}
								/>
								.
							</>
						)}
					</p>
				)}
			</div>
		</div>
	);
}

function TeaStatInline(props: { family: TeaFamily; sessions: number; ratio: number }) {
	return (
		<>
			<strong>
				<span className="font-header">{Math.round(props.ratio * 100)}%</span> {teaFamilies[props.family]}
			</strong>{" "}
			({props.sessions} sessions)
		</>
	);
}
