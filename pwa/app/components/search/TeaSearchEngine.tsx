import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, Origin, Tea, TeaFamily } from "~t/types";
import { CreateTeaButton } from "~/components/tea/CreateTeaButton";
import { TeaCard } from "~/components/tea/TeaCard";
import { SearchTextInput } from "~/components/search/SearchTextInput";
import { Paged } from "~/components/shared/paged/Paged";
import { SelectOrigin } from "~/components/origin/SelectOrigin";
import { handleUIEvent } from "~/utils/function";
import clsx from "clsx";
import { XCircleIcon } from "@heroicons/react/16/solid";
import { SelectFamily } from "~/components/family/SelectFamily";

export function TeaSearchEngine(props: {
	onSelect: (tea: Tea) => void;
	defaultFilters?: { q?: string; originPath?: string; family?: TeaFamily };
	value?: Tea;
	allowCreation?: boolean;
	onSearch?: (text: string | undefined) => void;
}) {
	const [filterSelector, setFilterSelector] = useState<"origin" | "family">();
	const [filters, setFilters] = useState<(typeof props.defaultFilters & { origin?: Origin }) | undefined>(
		props.defaultFilters,
	);

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
	const originQuery = useQuery({
		queryFn: async (ctx) => {
			return await (await getApi<Origin>(`/origins/${ctx.queryKey[1]}`)).json();
		},
		queryKey: ["origin", filters?.originPath],
		enabled: !filters?.origin && !!filters?.originPath,
		refetchOnWindowFocus: false,
	});
	const originFilter = filters?.origin ?? originQuery.data;

	function handleSearchUpdate(text?: string) {
		props.onSearch && props.onSearch(text);
		setFilters((st) => ({ ...st, q: text }));
	}

	async function onTeaCreated(tea: Tea) {
		void teasQuery.refetch();
		props.onSelect(tea);
	}

	return (
		<div className="h-full flex flex-col">
			<div className="py-4 bg-white border-b border-base-300 flex-none">
				<div className="px-4">
					<SearchTextInput
						onChange={handleSearchUpdate}
						defaultValue={props.defaultFilters?.q}
						loading={teasQuery.isPending}
					/>
				</div>
				<ul className="overflow-y-auto flex gap-x-2 px-4 mt-2">
					<li>
						<button
							className={clsx("btn", !!filters?.family && "btn-primary")}
							onClick={handleUIEvent(() => setFilterSelector("family"))}
						>
							{filters?.family ?? "Family"}
							{!!filters?.family && <XCircleIcon className="size-4 ml-2" />}
						</button>
					</li>
					<li>
						<button
							className={clsx("btn", !!filters?.originPath && "btn-primary")}
							onClick={handleUIEvent(() => setFilterSelector("origin"))}
						>
							{originQuery.isLoading ? (
								<span className="skeleton w-16 h-4" />
							) : (
								<>
									{originFilter?.name ?? "Origin"}
									{!!filters?.originPath && <XCircleIcon className="size-4 ml-2" />}
								</>
							)}
						</button>
					</li>
				</ul>
			</div>

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
									<li key={tea.id}>
										<TeaCard
											title={tea.displayName}
											family={tea.family}
											type={tea.type?.name}
											originPath={tea.originPath}
											cultivar={tea.cultivar}
											onClick={() => props.onSelect(tea)}
											selected={props.value?.id === tea.id}
											className="mb-2"
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

						{!!props.allowCreation && (
							<CreateTeaButton className="btn-dash btn-block h-14 mt-8" onCreated={onTeaCreated} />
						)}
					</div>
				)}
			</div>

			<Paged open={"origin" === filterSelector}>
				<SelectOrigin
					onSelect={(o) => {
						setFilters((st) => ({ ...st, origin: o, originPath: o?.path }));
						setFilterSelector(undefined);
					}}
					onBack={() => setFilterSelector(undefined)}
					defaultOriginPath={filters?.originPath}
					allowToggle
				/>
			</Paged>

			<Paged open={"family" === filterSelector}>
				<SelectFamily
					onSelect={(family) => {
						setFilters((st) => ({ ...st, family }));
						setFilterSelector(undefined);
					}}
					onBack={() => setFilterSelector(undefined)}
					defaultValue={filters?.family}
					allowToggle
				/>
			</Paged>
		</div>
	);
}
