import { Link } from "react-router";
import { useUser } from "~/auth/hooks/useUser";
import { AuthLayout } from "~/layouts/AuthLayout";
import { useToken } from "~/auth/hooks/useToken";
import { usePWAInstall } from "~/utils/browser/usePWAInstall";
import { handleUIEvent } from "~/utils/function";
import { ArrowDownCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import type { Route } from "../../../.react-router/types/app/pages/dashboard/+types/dashboard";
import { getApi } from "~/utils/api";
import type { MemberStats } from "~t/types";
import { CoffeeCup, Plus } from "iconoir-react";
import { IfAdmin } from "~/auth/components/voters/IfAdmin";
import { TeaLists } from "~/pages/dashboard/_components/TeaLists";
import { TeaShortCard } from "~/components/tea/TeaShortCard";

export function meta() {
	return [{ title: "Teatea" }];
}

export async function clientLoader(): Promise<MemberStats> {
	const response = await getApi<MemberStats>("/me/stats");
	return await response.json();
}

export default function Dashboard(props: Route.ComponentProps) {
	const [token] = useToken();
	const userQuery = useUser();
	const pwaInstall = usePWAInstall();

	return (
		<AuthLayout className="px-4" activeKey="home">
			<h1 className="my-6 text-xl">Hi, {userQuery?.data?.username}!</h1>

			{0 < props.loaderData.statsSessionsTotal && (
				<div className="grid grid-cols-2 gap-4">
					<Link
						className="bg-primary/10 text-primary rounded-md px-4 py-3"
						to={`/sessions?username=${userQuery.data?.username}`}
					>
						<div className="text-4xl font-bold mb-1">{props.loaderData.statsSessionsTotal}</div>
						<div className="text-sm mb-1 ">tea sessions</div>
						<div className="flex text-primary/60 items-center text-sm">
							See all <ArrowRightIcon className="ml-1 size-3" />
						</div>
					</Link>

					<Link className="bg-primary/10 text-primary rounded-md px-4 py-3" to="/me/teas">
						<div className="text-4xl font-bold mb-1">{props.loaderData.statsConsumedTeasTotal}</div>
						<div className="text-sm mb-1">teas tasted</div>
						<div className="flex text-primary/60 items-center text-sm">
							See all <ArrowRightIcon className="ml-1 size-3" />
						</div>
					</Link>
				</div>
			)}

			<Link
				to="/session/new"
				className="flex bg-primary/10 p-6 h-20 mt-4 items-center rounded-md text-lg text-primary"
			>
				<span className="inline-flex items-center">
					Ready for some tea? <CoffeeCup className="ml-2 size-5 opacity-60" />
				</span>
				<Plus className="ml-auto size-7" />
			</Link>

			{0 < props.loaderData.statsTopTeas.length && (
				<>
					<div className="mt-6 mb-2 text-xs uppercase text-base-content/60">What you drank the most</div>
					<ul>
						{props.loaderData.statsTopTeas.map((tea) => (
							<li key={tea.id} className="mb-2">
								<Link to={`/tea/${tea.id}`}>
									<TeaShortCard
										family={tea.family}
										type={tea.type}
										path={tea.originPath}
										cultivar={tea.cultivar}
										year={tea.year}
										roast={tea.roast}
										className="bg-slate-100"
									/>
								</Link>
							</li>
						))}
					</ul>
				</>
			)}

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
				<Link to="/admin" className="btn btn-block h-12 mt-40 mb-8">
					Admin dashboard
				</Link>
			</IfAdmin>
		</AuthLayout>
	);
}
