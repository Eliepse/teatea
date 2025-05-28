import type { Route } from "./+types/home";
import MagnifierIcon from "~/components/icons/magnifier";
import Leaf from "~/components/icons/leaf";
import { TypeFilterListAll, type TypeFilterValue } from "~/components/search/TypeFilterListAll";
import { type ChangeEvent, Fragment, useState } from "react";
import { OriginFilter, type OriginFilterValue } from "~/components/search/OriginFilter";
import { useQuery } from "@tanstack/react-query";
import { loader as filtersLoader } from "~/api/filters";

type Tea = {
	id: number;
	type_id: number;
	origin_id: number | null;
	cultivar_id: number | null;
	type: { category: string; family?: string; type?: string; subType?: string };
	cultivar_name: string | null;
	origin: { country?: string; region?: string; locality?: string } | null;
	harvest: { year?: number; month?: number; season?: string } | null;
	blend: boolean;
	altitude: number | null;
	name: string | null;
	roast_level: null;
	scented: boolean | null;
	smoked: number | null;
};

export function meta({}: Route.MetaArgs) {
	return [{ title: "Teatea" }];
}

export async function loader(args: Route.LoaderArgs) {
	return await filtersLoader(args);
}

export default function Home(props: Route.ComponentProps) {
	const [search, setSearch] = useState<string | null>(null);
	const [typeFilter, setTypeFilter] = useState<TypeFilterValue>([]);
	const [originFilter, setOriginFilter] = useState<OriginFilterValue>([]);

	const { data, isLoading } = useQuery({
		queryFn: async (query): Promise<Tea[]> => {
			const sp = new URLSearchParams();
			query.queryKey[1]?.types?.forEach((id) => sp.append("type[]", id));
			query.queryKey[1]?.origins?.forEach((id) => sp.append("origin[]", id));
			const response = await fetch(`/api/search?${sp.toString()}`);
			return await response.json();
		},
		queryKey: ["search", { types: typeFilter.map((t) => t.id), origins: originFilter.map((t) => t.id) }],
	});

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
					<TypeFilterListAll
						types={props.loaderData.types[1].children}
						value={typeFilter}
						onChange={setTypeFilter}
					/>
					<OriginFilter origins={props.loaderData.origins} value={originFilter} onChange={setOriginFilter} />
				</div>
			</header>

			<ul className="list bg-base-100 flex-1 overflow-auto">
				<li className="p-4 pb-2 text-xs tracking-wide text-accent-content/50 sticky top-0 bg-white z-10">
					All teas ({data?.length})
				</li>

				{data?.map((tea, i) => <TeaItem key={i} tea={tea} />)}
			</ul>
		</div>
	);
}

function TeaItem(props: { tea: Tea }) {
	const tea = props.tea;
	const hasName = !!tea.name;
	const isTea = "Tea" === tea.type.category;
	const type = [isTea ? null : tea.type.category, tea.type.family, tea.type.type, tea.type.subType].filter((v) => v);

	return (
		<li className="list-row">
			<div className="list-col-grow">
				<div className="text-xs text-base-content/60">
					{type.slice(0, hasName ? undefined : -1).map((name, i) => (
						<Fragment key={name}>
							{i !== 0 && <> &middot; </>}
							{name}
						</Fragment>
					))}
				</div>
				<span className="font-semibold">{hasName ? tea.name : type.slice(-1)[0]}</span>
			</div>
			<div className="text-right text-xs">
				{!!tea.origin && [tea.origin.region, tea.origin.country].filter((v) => v).join(", ")}
				{!!tea.cultivar_name && (
					<div className="text-base-content/50">
						{tea.cultivar_name} <Leaf className="size-3 text-green-400 inline" />
					</div>
				)}
			</div>
		</li>
	);
}
