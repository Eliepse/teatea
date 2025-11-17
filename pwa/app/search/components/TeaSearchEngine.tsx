import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import { type ApiPaginatedCollection, type Tea, type TeaFamily } from "~t/types";
import { CreateTeaButton } from "~/components/tea/CreateTeaButton";
import { SearchTextInput } from "~/search/components/SearchTextInput";
import { f, throwNotImplemented } from "~/utils/function";
import clsx from "clsx";
import { TeaShortCard } from "~/components/tea/TeaShortCard";
import { TeaFamilyFilter } from "~/search/components/TeaFamilyFilter";
import { SEFiltersBar } from "~/search/components/search-engine/SEFiltersBar";

export type SearchFilters = {
	q?: string;
	originPath?: string;
	family?: TeaFamily;
};

const SE_CONTEXT = createContext<{ filters: SearchFilters; patchFilters: (patch: SearchFilters) => void }>({
	filters: {},
	patchFilters: throwNotImplemented,
});

export function TeaSearchEngine(props: {
	onSelect: (tea: Tea) => void;
	defaultFilters?: { q?: string; originPath?: string; family?: TeaFamily };
	value?: Tea;
	allowCreation?: boolean;
	onSearch?: (text: string | undefined) => void;
}) {
	const [filters, setFilters] = useState<SearchFilters | undefined>(props.defaultFilters);

	const teasQuery = useInfiniteQuery({
		queryFn: async ({ queryKey, pageParam }) => {
			const filters = queryKey[1];

			if (typeof filters === "string") {
				throw new Error("Invalid search");
			}
			const queryParams = {
				...filters,
				origin: undefined, // Remove original filter
				originPath: filters.originPath,
			};

			const response = await getApi<ApiPaginatedCollection<Tea>>(
				pageParam ? `/teas?${pageParam}` : `/teas`,
				pageParam ? {} : queryParams,
			);
			return await response.json();
		},
		queryKey: ["search", { ...filters, itemsPerPage: 10, sort: "popularity" }],
		getPreviousPageParam: (lastPage) => lastPage.view.previous?.split("?")[1],
		getNextPageParam: (lastPage) => lastPage.view.next?.split("?")[1],
		initialPageParam: "",
	});

	function handleSearchUpdate(text?: string) {
		f(props.onSearch)(text);
		setFilters((st) => ({ ...st, q: text }));
	}

	const seContext = useMemo(
		() => ({
			filters: filters ?? {},
			patchFilters: (patch: SearchFilters) => setFilters((s) => ({ ...s, ...patch })),
		}),
		[filters],
	);

	const onTeaCreated = useCallback(
		async (tea: Tea) => {
			void teasQuery.refetch();
			props.onSelect(tea);
		},
		[props.onSelect],
	);

	return (
		<SE_CONTEXT.Provider value={seContext}>
			{" "}
			<div className="bg-green-50 min-h-dvh">
				<div className="sticky top-0 py-4 bg-green-50 border-b border-base-300">
					<div className="px-4">
						<SearchTextInput onChange={handleSearchUpdate} defaultValue={props.defaultFilters?.q} />
					</div>

					<SEFiltersBar className="px-4 mt-2" />
				</div>

				{undefined === filters?.family && !filters?.q && (
					<TeaFamilyFilter className="px-4 my-4" onSelect={(f) => setFilters((s) => ({ ...s, family: f }))} />
				)}

				<div className="py-4 flex-1 overflow-y-auto">
					{teasQuery.isLoading && undefined === teasQuery.data && (
						<ul className="px-4">
							<li className="skeleton h-16 mb-2 block"></li>
							<li className="skeleton h-16 mb-2 block"></li>
							<li className="skeleton h-16 mb-2 block"></li>
							<li className="skeleton h-16 mb-2 block"></li>
							<li className="skeleton h-16 mb-2 block"></li>
							<li className="skeleton h-16 mb-2 block"></li>
							<li className="skeleton h-16 mb-2 block"></li>
							<li className="skeleton h-16 mb-2 block"></li>
						</ul>
					)}

					{teasQuery.isError && <div className="text-error">Something went wrong...</div>}

					{teasQuery.isSuccess && teasQuery.data && (
						<div className="px-4">
							<div className="uppercase text-xs text-base-content/60 flex justify-between mb-4">
								<span>{teasQuery.data.pages[0].totalItems} results</span>
								<span>Sorted by popularity</span>
							</div>

							<ul>
								{teasQuery.data.pages.map((page) =>
									page.member?.map((tea) => (
										<li key={tea.id} className="mb-2" onClick={() => props.onSelect(tea)}>
											<TeaShortCard
												family={tea.family}
												type={tea.type}
												path={tea.originPath}
												cultivar={tea.cultivar}
												year={tea.year}
												roast={tea.roast}
												className={clsx(
													"border",
													props.value?.id === tea.id
														? "bg-primary/10 border-primary"
														: "bg-slate-100 border-transparent",
												)}
											/>
										</li>
									)),
								)}
							</ul>

							{!!teasQuery.hasNextPage && (
								<button
									className="btn btn-outline btn-secondary btn-block h-14 mt-4"
									onClick={() => teasQuery.fetchNextPage()}
								>
									Load more
								</button>
							)}
						</div>
					)}

					{teasQuery.isSuccess && true === props.allowCreation && (
						<div className="px-4 mt-4">
							<CreateTeaButton className="btn-dash btn-block h-14 mt-8" onCreated={onTeaCreated} />
						</div>
					)}
				</div>
			</div>
		</SE_CONTEXT.Provider>
	);
}

export function useSEContext() {
	return useContext(SE_CONTEXT);
}
