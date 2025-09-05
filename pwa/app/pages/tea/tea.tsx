import type { Route } from "../../../.react-router/types/app/pages/tea/+types/tea";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, Drink, Tea, TeaStats } from "~t/types";
import { useNavigate } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import { useQuery } from "@tanstack/react-query";
import { denormalizeDrink, type DrinkRaw } from "~/utils/api/normalization/drink";
import { formatDistanceToNow } from "date-fns";
import Leaf from "~/components/icons/leaf";
import WaterDrop from "~/components/icons/WaterDrop";
import { limit } from "~/utils/text";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const tea = await (await getApi<Tea>(`/teas/${args.params.id}`)).json();
	const stats = await (await getApi<TeaStats>(`/teas/${args.params.id}/stats`)).json();
	return { tea, stats };
}

export default function TeaPage(props: Route.ComponentProps) {
	const { tea, stats } = props.loaderData;
	const navigate = useNavigate();
	const familyLabel = tea.family[0].toUpperCase() + tea.family.substring(1);

	const drinksQuery = useQuery({
		queryFn: async (): Promise<ApiPaginatedCollection<Drink>> => {
			const response = await getApi<ApiPaginatedCollection<DrinkRaw>>(
				`/teas/${tea.id}/drinks?itemsPerPage=5&contentful=1`,
			);
			const payload = await response.json();
			return { ...payload, member: payload.member.map(denormalizeDrink) };
		},
		queryKey: ["page", tea["@id"], "drinks"],
	});

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
				<section className="px-4 mt-4">
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
				</section>

				{0 !== (drinksQuery.data?.member?.length ?? 0) && (
					<section className="px-4 mt-8">
						<h2 className="text-lg mb-4">Other's drink</h2>
						<ul>
							{drinksQuery.data?.member?.map((drink) => (
								<li className="mb-2">
									<article className="px-2 py-2 bg-base-200 rounded">
										<div className="flex text-xs gap-2 items-center">
											{!!drink.teaQuantity && (
												<div className="flex justify-between items-center rounded-md border leading-1 border-gray-400 p-1.5">
													<Leaf className="size-3 text-base-content/40 mr-2" />
													<span>{`${drink.teaQuantity} g`}</span>
												</div>
											)}

											{!!drink.waterMl && (
												<div className="flex justify-between items-center rounded-md border leading-1 border-gray-400 p-1.5">
													<WaterDrop className="size-3 text-base-content/40 mr-2" />
													<span>{`${drink.waterMl} ml`}</span>
												</div>
											)}

											<div className="ml-auto text-sm text-base-content/60">
												{formatDistanceToNow(drink.drankAt)} ago
											</div>
										</div>
										{!!drink.note && (
											<p className="mt-4 pt-2 italic border-t border-gray-300 text-sm text-base-content/70">
												{limit(drink.note, 96)}
											</p>
										)}
									</article>
								</li>
							))}
						</ul>
					</section>
				)}
			</main>
		</div>
	);
}
