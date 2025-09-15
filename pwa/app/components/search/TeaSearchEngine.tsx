import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiCollection, Origin, Tea } from "~t/types";
import { CreateTeaButton } from "~/components/tea/CreateTeaButton";
import { TeaShortCard } from "~/components/tea/TeaShortCard";
import { SearchTextInput } from "~/components/search/SearchTextInput";
import { Paged } from "~/components/shared/paged/Paged";
import { SelectOrigin } from "~/components/origin/SelectOrigin";
import { handleUIEvent } from "~/utils/function";
import clsx from "clsx";
import { XCircleIcon } from "@heroicons/react/16/solid";

export function TeaSearchEngine(props: {
	onSelect: (tea: Tea) => void;
	defaultFilters?: { q?: string; originPath?: string };
	value?: Tea;
	allowCreation?: boolean;
	onSearch?: (text: string | undefined) => void;
}) {
	const [filterSelect, setFilterSelect] = useState<"origin">();
	const [filters, setFilters] = useState<(typeof props.defaultFilters & { origin?: Origin }) | undefined>(
		props.defaultFilters,
	);

	const teasQuery = useQuery({
		queryFn: async ({ queryKey }) => {
			const filters = queryKey[1];

			if (typeof filters === "string") {
				throw new Error("Invalid search");
			}

			const response = await getApi<ApiCollection<Tea>>("/teas", {
				...filters,
				origin: undefined, // Remove original filter
				originPath: filters.originPath,
			});
			return await response.json();
		},
		queryKey: ["search", { ...filters, sort: "popularity" }],
	});
	const originQuery = useQuery({
		queryFn: async (ctx) => {
			return await (await getApi<Origin>(`/origins/path/${ctx.queryKey[1]}`)).json();
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
							className={clsx("btn", !!filters?.originPath && "btn-primary")}
							onClick={handleUIEvent(() => setFilterSelect("origin"))}
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
					{/*<li>*/}
					{/*	<button className="btn" disabled>*/}
					{/*		Type*/}
					{/*	</button>*/}
					{/*</li>*/}
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
							<span>{teasQuery.data.totalItems} results</span>
							<span>Sorted by popularity</span>
						</div>

						<ul>
							{teasQuery.data.member?.map((tea) => (
								<li key={tea.id}>
									<TeaShortCard
										title={tea.displayName}
										family={tea.family}
										type={tea.type?.name}
										originPath={tea.originPath}
										onClick={() => props.onSelect(tea)}
										selected={props.value?.id === tea.id}
										className="mb-2"
									/>
								</li>
							))}
						</ul>

						{!!props.allowCreation && (
							<CreateTeaButton className="btn-dash btn-block h-14 mt-8" onCreated={onTeaCreated} />
						)}
					</div>
				)}
			</div>

			<Paged open={"origin" === filterSelect}>
				<SelectOrigin
					onSelect={(o) => {
						setFilters((st) => ({ ...st, origin: o, originPath: o?.path?.join(".") }));
						setFilterSelect(undefined);
					}}
					onBack={() => setFilterSelect(undefined)}
					defaultValue={originFilter}
					allowToggle
				/>
			</Paged>
		</div>
	);
}
