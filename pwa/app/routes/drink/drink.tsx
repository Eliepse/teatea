import type { Route } from "../../../.react-router/types/app/routes/drink/+types/drinks";
import { fetchApi } from "~/utils/api";
import type { Drink } from "~t/types";
import { denormalizeDrink, type DrinkRaw } from "~/utils/api/normalization/drink";
import { intlFormat } from "date-fns";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import { Link, useNavigate } from "react-router";
import Arrow from "~/components/icons/arrow";

export async function clientLoader(props: Route.ClientLoaderArgs): Promise<Drink> {
	const id = props.params.id;

	if (!id || id <= 0) {
		throw new Error("Ooops, the id is invalid!");
	}

	const response = await fetchApi<DrinkRaw>(`/drinks/${id}`);
	return denormalizeDrink(await response.json());
}

export default function DrinkPage(props: Route.ComponentProps) {
	const navigate = useNavigate();
	const drink = props.loaderData as unknown as Drink;

	return (
		<div>
			<header className="p-4">
				<Link to="/me/drinks" className="block link mb-8">
					<Arrow direction="left" className="inline size-4 mr-2" />
					Drink history
				</Link>

				<div className="uppercase text-xs text-base-content/60">
					{intlFormat(drink.drankAt, { dateStyle: "long" })}
				</div>
				<div className="text-2xl mt-2">{drink.tea.displayName}</div>
				<div className="text-sm mt-1">
					<span>
						<span className="capitalize">{drink.tea.family}</span> tea
					</span>

					{drink.tea.originPath && (
						<span>
							{" "}
							&middot; <FormatOriginPath originPath={drink.tea.originPath} />
						</span>
					)}
				</div>
			</header>
			{/*<div className="p-4">*/}
			{/*	<h2 className="flex-1 text-sm text-base-content/60 mb-1">Tasting note</h2>*/}

			{/*	<p className="leading-normal">*/}
			{/*		Feuilles bien roulées, odeur chaude, entre beurre et fleurs blanches. Infusé en gong fu, eau à 90°C.*/}
			{/*		Les premières infusions sont douces, presque lactées, avec une belle rondeur.*/}
			{/*		<br />*/}
			{/*		Ensuite, ça tire un peu plus sur le végétal, le minéral. Très peu d’amertume, bonne longueur. J’ai*/}
			{/*		pris mon temps, c’était apaisant.*/}
			{/*	</p>*/}
			{/*</div>*/}
		</div>
	);
}
