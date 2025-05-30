import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Tea } from "~t/types";
import { ResultItem } from "./resultItem";
import { type FilterValue, SearchFilters } from "./searchFilters";

async function searchTeas(
	params: { types?: number[]; origins?: number[]; text?: string },
	signal?: AbortSignal,
): Promise<Tea[]> {
	const sp = new URLSearchParams();
	params.types?.forEach((id) => sp.append("type[]", id.toString()));
	params.origins?.forEach((id) => sp.append("origin[]", id.toString()));

	if (params.text) {
		sp.append("q", params.text);
	}

	const response = await fetch(`/api/search?${sp.toString()}`, { signal });
	return await response.json();
}

export function TeaSearch(props: { onSelect?: (tea: Tea) => void }) {
	const [filters, setFilters] = useState<FilterValue>({});

	const { data, isLoading } = useQuery({
		queryFn: async (query): Promise<Tea[]> => {
			return await searchTeas(
				{
					types: filters.types?.map((t) => t.id),
					origins: filters.origins?.map((o) => o.id),
					text: filters.text,
				},
				query.signal,
			);
		},
		queryKey: ["search", filters],
	});

	return (
		<div className="flex flex-col h-screen">
			<SearchFilters value={filters} onChange={setFilters} />

			<ul className="list bg-base-100 flex-1 overflow-auto">
				<li className="p-4 pb-2 text-xs tracking-wide text-accent-content/50 sticky top-0 bg-white z-10">
					All teas ({data?.length})
				</li>

				{data?.map((tea, i) => <ResultItem key={i} tea={tea} onClick={props.onSelect} />)}
			</ul>
		</div>
	);
}
