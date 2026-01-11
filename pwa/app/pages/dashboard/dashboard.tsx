import { Link, useNavigate } from "react-router";
import { useUser } from "~/auth/hooks/useUser";
import { AuthLayout } from "~/layouts/AuthLayout";
import { TokenUtils, useToken } from "~/auth/hooks/useToken";
import { usePWAInstall } from "~/utils/browser/usePWAInstall";
import { handleUIEvent } from "~/utils/function";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import type { Route } from "../../../.react-router/types/app/pages/dashboard/+types/dashboard";
import { getApi } from "~/utils/api";
import type { MemberStats } from "~t/types";
import { CoffeeCup, Leaf, PeopleTag } from "iconoir-react";
import { IfAdmin } from "~/auth/components/voters/IfAdmin";
import { TeaLists } from "~/pages/dashboard/_components/TeaLists";
import { TeaShortCard } from "~/components/tea/TeaShortCard";
import { Logo } from "~/components/icons/Logo";
import { UserStat } from "~/components/stats/UserStat";

export function meta() {
	return [{ title: "Teatea" }];
}

export async function clientLoader() {
	const token = TokenUtils.get();

	if (!token) {
		throw new Error("Token missing");
	}

	const response = await getApi<MemberStats>(`/members/${token.username}/stats`);
	return await response.json();
}

export default function Dashboard(props: Route.ComponentProps) {
	const [token] = useToken();
	const userQuery = useUser();
	const pwaInstall = usePWAInstall();
	const navigate = useNavigate();

	return (
		<AuthLayout className="px-4 bg-green-50 grid auto-rows-min gap-4 text-green-900" activeKey="home">
			<div className="flex items-center pt-4">
				<Logo className="w-24 flex-none mr-auto text-green-700" />
				<Link className="btn btn-lg btn-circle bg-white shadow-xs" to={`/members/${token?.username}`}>
					<PeopleTag className="size-6" />
				</Link>
			</div>

			<UserPresentation
				username={userQuery.data?.username}
				teaSessions={props.loaderData.statsSessionsTotal}
				tastedTeas={props.loaderData.statsConsumedTeasTotal}
			/>

			{0 < props.loaderData.statsTopTeaTypes.length && (
				<div className="bg-white rounded-xl shadow-sm">
					<div className="px-4 py-3 text-xs uppercase text-green-900/60 font-medium">
						Your tea types of choice
					</div>
					<ul>
						{props.loaderData.statsTopTeaTypes.map((type) => (
							<li key={type.id} className="border-t border-green-200">
								<Link to={`/tea_types/${type.slug}`}>
									<TeaShortCard family={type.family} type={type} />
								</Link>
							</li>
						))}
					</ul>
				</div>
			)}

			<Link to="/tea/search" className="flex items-center bg-green-600 text-white rounded-xl px-6 h-16 text-lg">
				Let&apos;s brew tea!
				<CoffeeCup className="ml-auto size-6" />
			</Link>

			<TeaLists />

			<p className="my-8 text-center">
				If you need help or have any feedback,
				<br />
				contact me at: {import.meta.env.PUBLIC_SUPPORT_EMAIL}
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
		</AuthLayout>
	);
}

function UserPresentation(props: { username?: string; teaSessions: number; tastedTeas: number }) {
	const displayedName = props.username ? props.username : <span className="skeleton w-16 h-4 ml-2 mr-1" />;

	return (
		<div className="bg-white rounded-xl px-4 py-2 text-lg shadow-sm">
			<div className="mr-auto inline-flex items-center font-medium">
				<PeopleTag className="size-5 mr-2" /> Hi, {displayedName}!
			</div>

			<div className="grid grid-cols-2 pb-2 pt-4 mt-1 border-t border-green-100">
				{!props.teaSessions && (
					<span className="text-green-800/60 col-span-2">
						Looks like you haven&apos;t drink tea yet <Leaf className="size-5 inline" />
					</span>
				)}
				{!!props.teaSessions && (
					<>
						<Link to={`/sessions?username=${props.username}`}>
							<UserStat
								title="tea sessions"
								value={props.teaSessions}
								icon={<CoffeeCup className="size-5 inline mx-1" />}
								withArrow
							/>
						</Link>

						<Link to="/me/teas">
							<UserStat
								title="tasted teas"
								value={props.tastedTeas}
								icon={<Leaf className="size-5 inline mx-1" />}
								withArrow
							/>
						</Link>
					</>
				)}
			</div>
		</div>
	);
}
