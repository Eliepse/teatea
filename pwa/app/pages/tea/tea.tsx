import type { Route } from "../../../.react-router/types/app/pages/tea/+types/tea";
import { getApi } from "~/utils/api";
import type { Tea, TeaStats } from "~t/types";
import { useNavigate } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const tea = await (await getApi<Tea>(`/teas/${args.params.id}`)).json();
	const stats = await (await getApi<TeaStats>(`/teas/${args.params.id}/stats`)).json();
	return { tea, stats };
}

export default function TeaPage(props: Route.ComponentProps) {
	const { tea, stats } = props.loaderData;
	const navigate = useNavigate();
	const familyLabel = tea.family[0].toUpperCase() + tea.family.substring(1);

	return (
		<div>
			<header className="p-4">
				<button className="btn btn-ghost p-0 mb-4" onClick={handleUIEvent(() => navigate(-1))}>
					<ArrowLeftIcon className="size-4 mr-1" /> Back
				</button>

				<div className="mb-2">
					<div className="text-base-content/60 mb-1">
						{!!tea.originPath && <FormatOriginPath originPath={tea.originPath} />}
					</div>
					<h1 className="text-3xl">{tea.type?.name ?? familyLabel}</h1>
				</div>

				<ul>
					{!!tea.type && (
						<li>
							<div className="badge badge-outline badge-accent">{tea.family} tea</div>
						</li>
					)}
				</ul>
			</header>
			<main>
				<div className="p-4">
					<div className="stats shadow w-full">
						<div className="stat">
							<div className="stat-value">{stats.drinksCount}</div>
							<div className="stat-desc">tea sessions</div>
						</div>
						<div className="stat">
							<div className="stat-value">{stats.drinkersCount}</div>
							<div className="stat-desc">people tried</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
