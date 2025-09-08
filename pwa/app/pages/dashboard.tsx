import { Link } from "react-router";
import { useUser } from "~/auth/hooks/useUser";
import { AuthLayout } from "~/layouts/AuthLayout";
import { useToken } from "~/auth/hooks/useToken";
import { usePWAInstall } from "~/utils/browser/usePWAInstall";
import { handleUIEvent } from "~/utils/function";
import { ArrowDownCircleIcon, ArrowRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import type { Route } from "../../.react-router/types/app/pages/+types/dashboard";
import { getApi } from "~/utils/api";
import type { MemberStats } from "~t/types";
import { CoffeeCup } from "iconoir-react";

export function meta() {
	return [{ title: "Teatea" }];
}

export async function clientLoader() {
	return await (await getApi<MemberStats>("/members/me/stats")).json();
}

export default function Dashboard(props: Route.ComponentProps) {
	const [token] = useToken();
	const userQuery = useUser();
	const pwaInstall = usePWAInstall();

	return (
		<AuthLayout className="px-4" activeKey="home">
			<h1 className="my-6 text-xl">Hi, {userQuery?.data?.username}!</h1>

			{0 < props.loaderData.statsDrinksTotal && (
				<div className="grid grid-cols-2 gap-4">
					<Link className="bg-base-200 border border-primary text-primary rounded-md px-4 py-2" to="/me/drinks">
						<div className="text-4xl font-bold mb-1">{props.loaderData.statsDrinksTotal}</div>
						<div className="text-xs mb-1 ">tea sessions</div>
						<div className="flex text-primary/60 items-center text-xs">See all <ArrowRightIcon className="ml-1 size-3" /></div>
					</Link>

					<div className="bg-base-200 border border-primary text-primary rounded-md px-4 py-2">
						<div className="text-4xl font-bold mb-1">{props.loaderData.statsConsumedTeasTotal}</div>
						<div className="text-xs">teas tasted</div>
						{/*<div className="flex text-white/80 items-center text-xs">See all <ArrowRightIcon className="ml-1 size-3" /></div>*/}
					</div>
				</div>
			)}

			<Link to="/drink/new" className="flex bg-base-200 p-6 h-20 mt-4 items-center justify-between rounded-md text-lg text-primary">
				Ready for some tea? <CoffeeCup className="size-7 opacity-60" />
			</Link>

			<p className="mt-8 text-base-content/60 text-sm">
				Welcome to your personal tea-journal !
				<br />
				This app is currently in a prototyping phase. Don&#39;t hesitate to send me feedbacks for any problem,
				idea or frustrations you have!
				<br />
				<br />
				Élie
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

			{token?.roles?.includes("ROLE_ADMIN") && (
				<Link to="/admin" className="btn btn-block h-12 mt-40">
					Admin dashboard
				</Link>
			)}
		</AuthLayout>
	);
}
