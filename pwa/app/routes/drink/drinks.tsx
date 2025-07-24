import { useNavigate } from "react-router";
import { handleUIEvent } from "~/utils/function";
import Arrow from "~/components/icons/arrow";
import type { Route } from "../../../.react-router/types/app/routes/drink/+types/drinks";
import { fetchApi } from "~/utils/api";
import type { ApiCollection, Drink, OriginPath, TeaType } from "~t/types";
import { formatDate, formatISO } from "date-fns";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";

export async function clientLoader(args: Route.ClientLoaderArgs): Promise<ApiCollection<Drink>> {
	const response = await fetchApi("/drinks");
	const data = await response.json();
	const deserializedItems = data.member?.map((drink: Drink) => ({
		...drink,
		drankAt: new Date(drink.drankAt),
	}));
	return {
		...data,
		member: deserializedItems,
	};
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
				<button className="btn btn-ghost" onClick={handleUIEvent(() => navigate(-1))}>
					<Arrow direction="left" />
				</button>

				<h1 className="text-lg mt-4">Drinks</h1>
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
											<Item
												family={drink.tea.family}
												type={drink.tea.type}
												path={drink.tea.originPath}
											/>
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

function Item(props: { family: string; type?: TeaType; path?: OriginPath }) {
	return (
		<article className="bg-base-200 px-3 py-2">
			<div className="flex justify-between text-xs text-base-content/60 mb-1">
				{/*<span>{undefined === props.type && <>{props.family} tea</>}</span>*/}
				<span>{props.family} tea</span>
				{props.path && <FormatOriginPath originPath={props.path} />}
			</div>
			<div>
				<span className="capitalize">{props.type?.name ?? `${props.family} tea`}</span>
			</div>
		</article>
	);
}
