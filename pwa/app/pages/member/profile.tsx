import { AuthLayout } from "~/layouts/AuthLayout";
import type { Route } from "../../../.react-router/types/app/pages/member/+types/profile";
import { getApi, postApi } from "~/utils/api";
import type { Member, MemberStats } from "~t/types";
import { usePopup } from "~/components/shared/modal/AlertManager";
import { TokenUtils, useToken } from "~/auth/hooks/useToken";
import { Link, useNavigate } from "react-router";
import { CoffeeCup, Leaf, LogOut, PeopleTag } from "iconoir-react";
import { UserStat } from "~/components/stats/UserStat";
import { BackButton } from "~/components/shared/navigation/BackButton";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const member = await (await getApi<Member>(`/members/${args.params.username}`)).json();
	const stats = await (await getApi<MemberStats>(`/members/${args.params.username}/stats`)).json();
	return { member, stats };
}

export default function ProfilePage(props: Route.ComponentProps) {
	const { member, stats } = props.loaderData;
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

			{!!stats.statsSessionsTotal && (
				<Stats
					sessions={stats.statsSessionsTotal}
					teas={stats.statsConsumedTeasTotal}
					username={isMemberSelf ? token?.username : undefined}
				/>
			)}
		</AuthLayout>
	);
}

function Stats(props: { sessions: number; teas: number; username?: string }) {
	const tastedTeasComp = (
		<UserStat
			title="tasted teas"
			value={props.teas}
			icon={<Leaf className="size-5 inline mx-1" />}
			withArrow={!!props.username}
		/>
	);

	return (
		<div className="grid grid-cols-2 px-4 py-4 mt-1 bg-white rounded-xl text-lg shadow-sm">
			{!!props.sessions && (
				<>
					<Link to={`/sessions?username=${props.username}`}>
						<UserStat
							title="tea sessions"
							value={props.sessions}
							icon={<CoffeeCup className="size-5 inline mx-1" />}
							withArrow
						/>
					</Link>

					{props.username ? <Link to="/me/teas">{tastedTeasComp}</Link> : tastedTeasComp}
				</>
			)}
		</div>
	);
}
