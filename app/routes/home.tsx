import type { Route } from "./+types/home";
import MagnifierIcon from "~/components/icons/magnifier";
import Leaf from "~/components/icons/leaf";
import type TeasType from "../../data/teas.json";
import fs from "fs/promises";
import path from "path";
import { TypeFilterListAll, type TypeFilterValue } from "~/components/search/TypeFilterListAll";
import { type ChangeEvent, useState } from "react";
import { OriginFilter, type OriginFilterValue } from "~/components/search/OriginFilter";
import { shuffle } from "~/utils/array";

type Teas = typeof TeasType;
type Tea = Teas[number];

export function meta({}: Route.MetaArgs) {
	return [{ title: "Teatea" }];
}

function unique(arr: any[]): any[] {
	return arr.reduce((carry, item) => {
		if (carry.includes(item)) {
			return carry;
		}

		carry.push(item);
		return carry;
	}, []);
}

export async function loader() {
	const dataPath = path.join(import.meta.dirname, "/../../data/teas.json");
	const rawFile = await fs.readFile(dataPath).then((a) => a.toString());
	const teas = JSON.parse(rawFile) as Tea[];

	const parts = { types: {}, cultivars: [], origins: [], teas: shuffle(teas) };

	teas.forEach((tea) => {
		const category = tea.category ?? "any";
		if (!parts.types[category]) {
			parts.types[category] = [];
		}

		if (tea.type) {
			parts.types[category].push(tea.type);
		}

		if (tea.cultivar) {
			parts.cultivars.push(tea.cultivar);
		}

		if (tea.origin?.country) {
			parts.origins.push(tea.origin.country);
		}
	});

	parts.types = Object.fromEntries(Object.entries(parts.types).map(([key, vals]) => [key, unique(vals)]));
	parts.cultivars = unique(parts.cultivars);
	parts.origins = unique(parts.origins).map((c) => ({ name: c }));

	return parts;
}

export default function Home(props: Route.ComponentProps) {
	const [search, setSearch] = useState<string | null>(null);
	const [typeFilter, setTypeFilter] = useState<TypeFilterValue>({});
	const [originFilter, setOriginFilter] = useState<OriginFilterValue>([]);
	const teaCategories = Object.entries(typeFilter)
		.filter(([_, v]) => v || 0 < (v || []).length)
		.map(([k]) => k);
	const filteredTeas = props.loaderData.teas.filter(filterTea);
	const isFiltered = filteredTeas.length !== props.loaderData.teas.length;

	function filterTea(tea: Tea): boolean {
		const hasCategoryFilter = 0 !== teaCategories.length;

		if (hasCategoryFilter && false === teaCategories.includes(tea.category)) {
			return false;
		}

		const categoryFilter = typeFilter[tea.category] || [];
		if (hasCategoryFilter) {
			if (!tea.type || (true !== categoryFilter && false === categoryFilter.includes(tea.type))) {
				return false;
			}
		}

		if (0 !== originFilter.length && !originFilter.includes(tea.origin?.country)) {
			return false;
		}

		if (null !== search) {
			if (tea.name && tea.name.toLowerCase().includes(search)) {
				return true;
			}

			if (tea.cultivar && tea.cultivar.toLowerCase().includes(search)) {
				return true;
			}

			if (tea.type && tea.type.toLowerCase().includes(search)) {
				return true;
			}

			if (tea.origin?.region && tea.origin.region.toLowerCase().includes(search)) {
				return true;
			}

			if (tea.origin?.locality && tea.origin.locality.toLowerCase().includes(search)) {
				return true;
			}

			return false;
		}

		return true;
	}

	function onSearchChange(e: ChangeEvent<HTMLInputElement>) {
		e.stopPropagation();
		const value = e.currentTarget.value.trim().toLowerCase();
		setSearch(value || null);
	}

	return (
		<div className="flex flex-col h-screen">
			<header className="p-4 flex-none">
				<div className="flex mb-2">
					<label className="input mr-2 flex-1">
						<MagnifierIcon className="h-[1em] opacity-50" />
						<input type="search" className="grow" placeholder="Search" onChange={onSearchChange} />
					</label>

					{/*<button className="btn">*/}
					{/*	<AdjustmentsVerticalIcon className="size-6" />*/}
					{/*	Filters*/}
					{/*</button>*/}
				</div>

				<div className="">
					<TypeFilterListAll types={props.loaderData.types} value={typeFilter} onChange={setTypeFilter} />
					<OriginFilter origins={props.loaderData.origins} value={originFilter} onChange={setOriginFilter} />
				</div>
			</header>

			<ul className="list bg-base-100 flex-1 overflow-auto">
				<li className="p-4 pb-2 text-xs tracking-wide text-accent-content/50 sticky top-0 bg-white z-10">
					{isFiltered ? "Search results" : "All teas"} ({filteredTeas.length})
				</li>

				{(isFiltered ? filteredTeas : props.loaderData.teas).map((tea, i) => (
					<Item
						key={i}
						category={tea.category}
						type={tea.type}
						name={tea.name}
						cultivar={tea.cultivar}
						origin={tea.origin}
					/>
				))}
			</ul>
		</div>
	);
}

function Item(props: {
	type: string | null;
	category: string;
	name?: string | null;
	origin?: { country: string; region?: string | null; locality?: string | null };
	cultivar?: string | null;
}) {
	return (
		<li className="list-row">
			<div className="list-col-grow">
				<div className="text-xs text-base-content/60">
					{(!!props.name || !!props.type) && (
						<>
							{props.category}
							{!!props.name && <> &middot; {props.type}</>}
						</>
					)}
				</div>
				<span className="font-semibold">{props.name ?? props.type ?? props.category}</span>
			</div>
			<div className="text-right text-xs">
				{!!props.origin && [props.origin.region, props.origin.country].filter((s) => !!s).join(", ")}
				{!!props.cultivar && (
					<div className="text-base-content/50">
						{props.cultivar} <Leaf className="size-3 text-green-400 inline" />
					</div>
				)}
			</div>
		</li>
	);
}
