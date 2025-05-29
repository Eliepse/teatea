import type { Route } from "./+types/home";
import MagnifierIcon from "~/components/icons/magnifier";
import Leaf from "~/components/icons/leaf";
import { TypeFilterListAll, type TypeFilterValue } from "~/components/search/TypeFilterListAll";
import { type ChangeEvent, Fragment, useState } from "react";
import { OriginFilter, type OriginFilterValue } from "~/components/search/OriginFilter";
import { useQuery } from "@tanstack/react-query";
import { loader as filtersLoader } from "~/api/filters";
import { ResultItem } from "~/components/search/tea-search/resultItem";
import type { Tea } from "~t/types";

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
						types={props.loaderData.types.Tea?.children ?? []}
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

				{data?.map((tea, i) => <ResultItem key={i} tea={tea} onClick={console.debug} />)}
			</ul>
		</div>
	);
}
