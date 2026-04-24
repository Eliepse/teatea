import { Link, redirect, useNavigate } from "react-router";
import { useUser } from "~/auth/hooks/useUser";
import { WithMainMenu } from "~/layouts/WithMainMenu";
import { TokenUtils, useToken } from "~/auth/hooks/useToken";
import { usePWAInstall } from "~/utils/browser/usePWAInstall";
import { handleUIEvent } from "~/utils/function";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import type { Route } from "../../../.react-router/types/app/pages/dashboard/+types/dashboard";
import { CoffeeCup, Leaf, PeopleTag } from "iconoir-react";
import { IfAdmin } from "~/auth/components/voters/IfAdmin";
import { TeaLists } from "~/pages/dashboard/_components/TeaLists";
import { Logo } from "~/components/icons/Logo";
import { UserStat } from "~/components/stats/UserStat";
import { useQuery } from "@tanstack/react-query";
import { makeMemberStatsQueryOpt } from "~/account/query/memberStatsQuery";

export function meta() {
	return [{ title: "Teatea" }];
}

export async function clientLoader() {
	const token = TokenUtils.get();

	if (!token) {
		return redirect("/");
	}

	return { username: token.username };
}

export default function Dashboard(props: Route.ComponentProps) {
	const data = props.loaderData;
	const [token] = useToken();
	const userQuery = useUser();
	const pwaInstall = usePWAInstall();
	const navigate = useNavigate();

	return (
		<WithMainMenu className="px-4 bg-green-50 grid auto-rows-min gap-4 text-green-900" activeKey="home">
			<div className="flex items-center pt-4">
				<Logo className="w-24 flex-none mr-auto text-green-700" />
				<Link className="btn btn-lg btn-circle bg-white shadow-xs" to={`/members/${data.username}`}>
					<PeopleTag className="size-6" />
				</Link>
			</div>

			<UserPresentation username={data.username} />

			<Link to="/tea/search" className="flex items-center bg-green-600 text-white rounded-xl px-6 h-16 text-lg">
				Let&apos;s brew tea!
				<CoffeeCup className="ml-auto size-6" />
			</Link>

			<TeaLists />

			<p className="my-8 text-center">
				If you need help or have any feedback,
				<br />
				contact me at: {runtimeEnv.VITE_SUPPORT_EMAIL}
			</p>

			{pwaInstall.installable && false === pwaInstall.installed && (
				<button
					className="btn btn-outline btn-primary btn-block h-12 mt-8"
					onClick={handleUIEvent(pwaInstall.prompt)}
				>
					Install the web app
					<ArrowDownCircleIcon className="ml-2 size-5" />
				</button>
			)}

			<IfAdmin>
				<Link to="/admin" className="btn btn-lg btn-block bg-white h-12 mt-40 mb-16 shadow-sm">
					Admin dashboard
				</Link>
			</IfAdmin>
		</WithMainMenu>
	);
}

function UserPresentation(props: { username: string }) {
	const statsQuery = useQuery(makeMemberStatsQueryOpt(props.username));
	const teaSessions = statsQuery.data?.statsSessionsTotal ?? 0;
	const tastedTeas = statsQuery.data?.statsConsumedTeasTotal ?? 0;

	return (
		<div className="bg-white rounded-xl px-4 py-2 text-lg shadow-sm">
			<div className="mr-auto inline-flex items-center font-medium">
				<PeopleTag className="size-5 mr-2" /> Hi, {props.username}!
			</div>

			<div className="grid grid-cols-2 pb-2 pt-4 mt-1 border-t border-green-100">
				<Link to={`/sessions?username=${props.username}`}>
					<UserStat
						title="tea sessions"
						value={teaSessions}
						icon={<CoffeeCup className="size-5 inline mx-1" />}
						withArrow
						loading={statsQuery.isLoading}
					/>
				</Link>

				<Link to="/me/teas">
					<UserStat
						title="tasted teas"
						value={tastedTeas}
						icon={<Leaf className="size-5 inline mx-1" />}
						withArrow
						loading={statsQuery.isLoading}
					/>
				</Link>
			</div>
		</div>
	);
}
