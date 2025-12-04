import { useCallback, useMemo, useState } from "react";
import type { Origin, Tea, TeaFamily, TeaType } from "~t/types";
import { CreateTeaButton } from "~/components/tea/CreateTeaButton";
import { f } from "~/utils/function";
import clsx from "clsx";
import { TeaFamilyFilter } from "~/search/components/TeaFamilyFilter";
import { SEFiltersBar } from "~/search/components/search-engine/SEFiltersBar";
import { Family } from "~/components/tea/Family";
import { useNavigate } from "react-router";
import { SE_CONTEXT, type SearchFilters, useSearchQuery } from "~/search/hooks/useSearchQuery";
import { TeaCard } from "~/components/tea/TeaCard";
import { useResourceQuery } from "~/utils/api/useResourceQuery";
import { SearchTextInput } from "~/search/components/SearchTextInput";

export function TeaSearchEngine(props: {
	onSelect?: (tea: Tea | TeaType) => void;
	defaultFilters?: SearchFilters;
	value?: Tea;
	allowCreation?: boolean;
	onFiltersChange?: (filters?: SearchFilters) => void;
}) {
	const navigate = useNavigate();
	const [filters, setFilters] = useState<SearchFilters | undefined>(props.defaultFilters);
	const typeQuery = useResourceQuery<TeaType>(filters?.type, "/api/tea_types/");
	const SEContext = useMemo(
		() => ({
			filters: filters ?? {},
			patchFilters: (patch: SearchFilters) => {
				const patched = { ...filters, ...patch };
				setFilters(patched);
				f(props.onFiltersChange)(patched);
			},
			searchType: computeSearchType(filters),
		}),
		[filters, props.onFiltersChange],
	);

	const { query, isTeas } = useSearchQuery(SEContext.searchType, filters);

	function handleSearchUpdate(text?: string) {
		SEContext.patchFilters({ q: text });
	}

	function handleItemClicked(item: Tea | TeaType): void {
		if (props.onSelect) {
			props.onSelect(item);
			return;
		}

		if ("type" in item) {
			navigate(`/tea/${item.id}`);
			return;
		}

		if ("name" in item) {
			navigate(`/tea_types/${item.slug}`);
			return;
		}
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
							<Item
								label={typeQuery?.data?.name}
								family={typeQuery?.data?.family}
								origin={typeQuery?.data?.origin}
								className="bg-white border border-green-700/20"
							/>
						)}
						{filters?.type && !typeQuery.data && <div className="skeleton h-16 rounded-2xl" />}
						{!filters?.type && (
							<SearchTextInput onChange={handleSearchUpdate} defaultValue={props.defaultFilters?.q} />
						)}
					</div>

					<SEFiltersBar className="px-4 mt-2" />
				</div>

				{!filters?.family && !filters?.type && !filters?.q && (
					<TeaFamilyFilter className="px-4 my-4" onSelect={(family) => SEContext.patchFilters({ family })} />
				)}

				<div className="py-4 flex-1 overflow-y-auto">
					{query.isError && <div className="text-error px-4">Something went wrong...</div>}

					{query.isSuccess && query.data && (
						<div className="px-4">
							<div className="uppercase text-xs text-base-content/60 flex justify-between mb-4">
								<span>
									{query.data.pages[0].totalItems} {isTeas ? "teas" : "tea types"}
								</span>
								<span>Sorted by popularity</span>
							</div>

							<ul>
								{query.data.pages.map((page) =>
									page.member?.map((item) => (
										<li key={item["@id"]} className={clsx("type" in item ? "mb-3" : "mb-2")}>
											{"name" in item && (
												<Item
													label={item.name}
													family={item.family}
													origin={item.origin}
													onClick={() => handleItemClicked(item)}
													className={"bg-white shadow-xs"}
												/>
											)}

											{"type" in item && (
												<TeaCard
													type={item.type}
													family={item.family}
													origin={item.originPath}
													cultivar={item.cultivar}
													year={item.year}
													roast={item.roast}
													className={clsx("bg-white shadow-xs")}
													onClick={() => handleItemClicked(item)}
												/>
											)}
										</li>
									)),
								)}
							</ul>
						</div>
					)}

					{query.isFetching && (
						<ul className="px-4">
							<li className="skeleton h-16 mb-2 block" />
							<li className="skeleton h-16 mb-2 block" />
							<li className="skeleton h-16 mb-2 block" />
							<li className="skeleton h-16 mb-2 block" />
							<li className="skeleton h-16 mb-2 block" />
						</ul>
					)}

					{!!query.hasNextPage && (
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

/**
 * Determine if the search engine should display
 * teas or type of teas based on the given filters
 */
function computeSearchType(filters?: SearchFilters): "teas" | "tea_types" {
	if (undefined === filters) {
		return "tea_types";
	}

	if (filters.type || filters.cultivar) {
		return "teas";
	}

	if (1 < (filters.originPath?.split(".")?.length ?? 0)) {
		return "teas";
	}

	return "tea_types";
}

function Item(props: { label?: string; family: TeaFamily; origin?: Origin; onClick?: () => void; className?: string }) {
	return (
		<article
			className={clsx(
				"rounded-2xl min-h-16 px-4 py-3 flex items-center",
				"bg-white text-green-900 text-lg",
				!!props.onClick && "cursor-pointer hover:outline-1 active:bg-green-200 outline-green-400",
				!!props.onClick && "focus:outline-2 focus:outline-green-600",
				props.className,
			)}
			onClick={props.onClick}
			tabIndex={0}
		>
			<div className="flex-1">
				{props.label ? (
					<div className="text-xs font-medium tracking-wide uppercase text-green-800/60">
						<Family family={props.family} iconOnly className="mr-1" />
						{props.family}
					</div>
				) : (
					<Family family={props.family} iconOnly className="mr-2" />
				)}
				<span className="capitalize">{props.label ?? `${props.family} tea`}</span>
			</div>

			<div className="text-sm text-green-800/60">{props.origin && <div>{props.origin.namePath[0]}</div>}</div>
		</article>
	);
}
