import { Link, useNavigate } from "react-router";
import { useUser } from "~/auth/hooks/useUser";
import { AuthLayout } from "~/layouts/AuthLayout";
import { TokenUtils } from "~/auth/hooks/useToken";
import { usePWAInstall } from "~/utils/browser/usePWAInstall";
import { handleUIEvent } from "~/utils/function";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import type { Route } from "../../../.react-router/types/app/pages/dashboard/+types/dashboard";
import { getApi, postApi } from "~/utils/api";
import type { MemberStats } from "~t/types";
import { ArrowRightCircle, CoffeeCup, Leaf, LogOut, PeopleTag } from "iconoir-react";
import { IfAdmin } from "~/auth/components/voters/IfAdmin";
import { TeaLists } from "~/pages/dashboard/_components/TeaLists";
import { TeaShortCard } from "~/components/tea/TeaShortCard";
import { usePopup } from "~/components/shared/modal/AlertManager";
import { Logo } from "~/components/icons/Logo";
import type { ReactNode } from "react";

export function meta() {
	return [{ title: "Teatea" }];
}

export async function clientLoader(): Promise<MemberStats> {
	const response = await getApi<MemberStats>("/me/stats");
	return await response.json();
}

export default function Dashboard(props: Route.ComponentProps) {
	const userQuery = useUser();
	const pwaInstall = usePWAInstall();
	const popup = usePopup();
	const navigate = useNavigate();

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
		<AuthLayout className="px-4 bg-green-50 grid gap-4 text-green-900" activeKey="home">
			<div className="flex items-center pt-4">
				<Logo className="w-24 flex-none mr-auto text-green-700" />
				<button className="btn btn-lg btn-circle bg-white" onClick={promptLogout}>
					<LogOut className="size-4" />
				</button>
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

			<Link to="/session/new" className="flex items-center bg-green-600 text-white rounded-xl px-6 h-16 text-lg">
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

			{!!props.teaSessions && (
				<div className="grid grid-cols-2 pb-2 pt-4 mt-1 border-t border-green-100">
					<Link to={`/sessions?username=${props.username}`}>
						<UserStat
							title="tea sessions"
							value={props.teaSessions}
							icon={<CoffeeCup className="size-5 inline mx-1" />}
						/>
					</Link>

					<Link to="/me/teas">
						<UserStat
							title="tasted teas"
							value={props.tastedTeas}
							icon={<Leaf className="size-5 inline mx-1" />}
						/>
					</Link>
				</div>
			)}
		</div>
	);
}

function UserStat(props: { title: ReactNode; value: number; icon: ReactNode; className?: string }) {
	return (
		<div className={props.className}>
			<div className="text-4xl font-bold font-header text-green-700">
				{props.value}
				{props.icon}
			</div>
			<div className="flex items-center text-sm">
				{props.title}
				<ArrowRightCircle direction="right" className="size-3 ml-1 translate-y-0.5 inline" />
			</div>
		</div>
	);
}
