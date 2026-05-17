import { useCallback, useMemo, useState } from "react";
import type { Tea, TeaType } from "~t/types";
import { CreateTeaButton } from "~/components/tea/CreateTeaButton";
import { f } from "~/utils/function";
import clsx from "clsx";
import { FiltersBar } from "~/catalog/components/search-engine/FiltersBar";
import { useNavigate } from "react-router";
import { SE_CONTEXT, type SearchFilters } from "~/catalog/hooks/useSearchQuery";
import { TeaCard } from "~/components/tea/TeaCard";
import { SearchTextInput } from "~/catalog/components/SearchTextInput";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { makeTeaTypeQueryOpt } from "~/catalog/query/teatypeQuery";
import { makeSearchInfinitQueryOpt } from "~/catalog/query/searchQuery";
import { SmartFiltersBar } from "~/catalog/components/search-engine/SmartFiltersBar";
import { SearchTypeCard } from "~/catalog/components/SearchTypeCard";

export function TeaSearchEngine(props: {
	onSelect?: (tea: Tea | TeaType) => void;
	defaultFilters?: SearchFilters;
	value?: Tea;
	allowCreation?: boolean;
	onFiltersChange?: (filters?: SearchFilters) => void;
}) {
	const navigate = useNavigate();
	const [filters, setFilters] = useState<SearchFilters>(props.defaultFilters ?? {});
	const typeQuery = useQuery(makeTeaTypeQueryOpt({ slug: filters?.type }, filters?.origin));
	const query = useInfiniteQuery(makeSearchInfinitQueryOpt(filters));
	const SEContext = useMemo(
		() => ({ filters, loading: query.isLoading }),
		[filters, props.onFiltersChange, typeQuery.data, query.isLoading],
	);

	function patchFilters(patch: Partial<SearchFilters>) {
		const patched = { ...filters, ...patch };
		setFilters(patched);
		f(props.onFiltersChange)(patched);
	}

	function handleSearchUpdate(text?: string) {
		patchFilters({ q: text });
	}

	function handleItemClicked(item: Tea): void {
		if (props.onSelect) {
			props.onSelect(item);
			return;
		}

		navigate(`/tea/${item.id}`);
	}

	const onTeaCreated = useCallback(
		async (tea: Tea) => {
			void query.refetch();
			f(props.onSelect)(tea);
		},
		[props.onSelect, query],
	);

	return (
		<SE_CONTEXT.Provider value={SEContext}>
			<div className="bg-green-50 min-h-dvh">
				<div className="sticky top-0 z-10 py-4 bg-green-50 border-b border-base-300">
					<div className="px-4">
						{typeQuery.data && (
							<SearchTypeCard
								label={typeQuery?.data?.name}
								family={typeQuery?.data?.family}
								origin={typeQuery?.data?.origin}
								className="bg-white border border-green-700/20"
								onClick={() => patchFilters({ type: undefined })}
								closable
							/>
						)}
						{filters?.type && !typeQuery.data && <div className="skeleton h-16 rounded-2xl" />}
						{!filters?.type && (
							<SearchTextInput onChange={handleSearchUpdate} defaultValue={props.defaultFilters?.q} />
						)}
					</div>

					<FiltersBar filters={filters} onChange={patchFilters} className="px-4 mt-2" />
				</div>

				<SmartFiltersBar filters={filters} onChange={patchFilters} className="px-4 my-4" />

				<div className="py-4 flex-1 overflow-y-auto">
					{query.isError && <div className="text-error px-4">Something went wrong...</div>}

					{query.isSuccess && query.data && (
						<div className="px-4">
							<div className="uppercase text-xs text-base-content/60 flex justify-between mb-4">
								<span>{query.data.pages[0].totalItems} teas</span>
								<span>Sorted by popularity</span>
							</div>

							<ul>
								{query.data.pages.map((page) =>
									page.member?.map((item) => (
										<li
											key={item["@id"] + item.origin?.path}
											className={clsx("type" in item ? "mb-3" : "mb-2")}
										>
											<TeaCard
												type={item.type}
												family={item.family}
												origin={item.originPath}
												cultivar={item.cultivar}
												year={item.year}
												roast={item.roast}
												business={item.business}
												className={clsx("bg-white shadow-xs")}
												onClick={() => handleItemClicked(item)}
											/>
										</li>
									)),
								)}
							</ul>
						</div>
					)}

					{query.isFetching && (
						<div className="px-4">
							<div className="uppercase text-xs text-base-content/60 flex justify-between mb-4">
								<span className="skeleton w-16 h-5 block" />
							</div>

							<ul>
								<li className="skeleton h-32 mb-2 block" />
								<li className="skeleton h-32 mb-2 block" />
								<li className="skeleton h-32 mb-2 block" />
								<li className="skeleton h-32 mb-2 block" />
								<li className="skeleton h-32 mb-2 block" />
							</ul>
						</div>
					)}

					{query.hasNextPage && (
						<div className="px-4">
							<button
								className="btn btn-outline btn-secondary btn-block h-14 mt-4"
								onClick={() => query.fetchNextPage()}
							>
								Load more
							</button>
						</div>
					)}

					{query.isSuccess && true === props.allowCreation && (
						<div className="px-4 mt-4">
							<CreateTeaButton className="btn-dash btn-block h-14 mt-8" onCreated={onTeaCreated} />
						</div>
					)}
				</div>
			</div>
		</SE_CONTEXT.Provider>
	);
}
