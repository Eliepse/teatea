import { Link, useNavigate } from "react-router";
import Arrow from "~/components/icons/arrow";
import type { Route } from "../../../.react-router/types/app/routes/drink/+types/drinks";
import { fetchApi } from "~/utils/api";
import type { ApiCollection, Drink, OriginPath, TeaType } from "~t/types";
import { formatDate, formatISO } from "date-fns";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import { denormalizeDrink, type DrinkRaw } from "~/utils/api/normalization/drink";
import { limit } from "~/utils/text";

export async function clientLoader(args: Route.ClientLoaderArgs): Promise<ApiCollection<Drink>> {
	const response = await fetchApi<ApiCollection<DrinkRaw>>("/drinks");
	const data = await response.json();
	return { ...data, member: data.member.map(denormalizeDrink) };
}

export default function ListDrinks(props: Route.ComponentProps) {
	const navigate = useNavigate();
	const items = props.loaderData.member;

	const drinksByDay = items.reduce(
		(days, drink) => {
			const date = formatISO(drink.drankAt, { representation: "date" });
			days[date] = [...(days[date] ?? []), drink];
			return days;
		},
		{} as { [key: string]: Drink[] },
	);

	return (
		<div>
			<header className="p-4">
				<Link to="/welcome" className="btn btn-ghost -ml-4">
					<Arrow direction="left" />
				</Link>

				<h1 className="text-lg mt-2">Drinks</h1>
			</header>
			<div>
				<ul className="p-4">
					{Object.entries(drinksByDay).map(([dateKey, drinks]) => {
						const date = drinks[0].drankAt;

						return (
							<li key={dateKey} className="mb-12">
								<div className="leading-tight mb-4 text-lg">
									<span className="text-xs uppercase text-base-content/60">
										{formatDate(date, "yyyy")}
									</span>
									<br />
									<span>{formatDate(date, "d MMMM")}</span>
								</div>
								<ul>
									{drinks.map((drink) => (
										<li key={drink.id} className="mb-2">
											<Link to={`/me/drink/${drink.id}`}>
												<Item
													family={drink.tea.family}
													type={drink.tea.type}
													path={drink.tea.originPath}
													note={drink.note}
													grams={drink.teaQuantity}
												/>
											</Link>
										</li>
									))}
								</ul>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}

function Item(props: { family: string; type?: TeaType; path?: OriginPath; note?: string; grams?: number }) {
	return (
		<article className="bg-base-200 pt-2 pb-2">
			<div className="px-3 flex justify-between text-xs text-base-content/60 mb-1">
				<span>
					<span className="capitalize">{props.family}</span> tea
				</span>
				{props.path && <FormatOriginPath originPath={props.path} />}
			</div>
			<div className="px-3 pb-1 flex">
				<span className="capitalize">{props.type?.name ?? `${props.family} tea`}</span>
				<span className="ml-auto">{props.grams ? `${props.grams} g` : null}</span>
			</div>
			{!!props.note && (
				<div className="border-t border-base-300 pt-2 px-3 text-base-content/60 text-sm">
					{limit(props.note, 96)}
				</div>
			)}
		</article>
	);
}
