import { Link, useNavigate } from "react-router";
import type { Route } from "../../../.react-router/types/app/pages/drink/+types/drinks";
import { fetchApi } from "~/utils/api";
import type { ApiCollection, Drink, OriginPath, TeaType } from "~t/types";
import { formatDate, formatISO } from "date-fns";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import { denormalizeDrink, type DrinkRaw } from "~/utils/api/normalization/drink";
import { limit } from "~/utils/text";
import { AuthLayout } from "~/layouts/AuthLayout";
import { ActivityGraph } from "~/components/activity/ActivityGraph";
import { PlusIcon } from "@heroicons/react/24/outline";

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

	if (0 === items.length) {
		return (
			<AuthLayout className="p-4 flex items-center" activeKey="activity">
				<p className="text-base-content/60 text-center">
					This page shows your recent activity, but you haven't save any tea session yet.{" "}
					Start your tea journal by {" "}
					<Link to="/drink/new" className="link link-primary">
						recording your first session!
					</Link>
				</p>

				<Link
					to="/drink/new"
					className="absolute right-3 bottom-3 btn btn-primary rounded-full h-12 w-12 shadow-md"
				>
					<PlusIcon className="size-4" />
				</Link>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout className="p-4" activeKey="activity">
			<p className="text-sm text-content/60">Your activity this year</p>
			<ActivityGraph className="my-2" />

			<ul className="py-4">
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
												ml={drink.waterMl}
											/>
										</Link>
									</li>
								))}
							</ul>
						</li>
					);
				})}
			</ul>

			<Link
				to="/drink/new"
				className="absolute right-3 bottom-3 btn btn-primary rounded-full h-12 w-12 shadow-md"
			>
				<PlusIcon className="size-4" />
			</Link>
		</AuthLayout>
	);
}

function Item(props: {
	family: string;
	type?: TeaType;
	path?: OriginPath;
	note?: string;
	grams?: number;
	ml?: number;
}) {
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
				<span className="ml-auto">
					{[props.grams ? `${props.grams} g` : null, props.ml ? `${props.ml} ml` : null]
						.filter((v) => v)
						.join(" · ")}
				</span>
			</div>
			{!!props.note && (
				<div className="border-t border-base-300 pt-2 px-3 text-base-content/60 text-sm">
					{limit(props.note, 96)}
				</div>
			)}
		</article>
	);
}
