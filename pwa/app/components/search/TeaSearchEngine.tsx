import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiCollection, Tea } from "~t/types";
import { CreateTeaButton } from "~/components/tea/CreateTeaButton";
import { TeaShortCard } from "~/components/tea/TeaShortCard";
import { SearchTextInput } from "~/components/search/SearchTextInput";

export function TeaSearchEngine(props: { onSelect: (tea: Tea) => void; value?: Tea; allowCreation?: boolean }) {
	const [searchText, setSearchText] = useState<string>();

	const teasQuery = useQuery({
		queryFn: async ({ queryKey }) => {
			const params = queryKey[1];

			if (typeof params === "string") {
				throw new Error("Invalid search");
			}

			const response = await getApi<ApiCollection<Tea>>("/teas", params);
			return await response.json();
		},
		queryKey: ["search", { q: searchText, sort: "popularity" }],
	});

	async function onTeaCreated(tea: Tea) {
		void teasQuery.refetch();
		props.onSelect(tea);
	}

	return (
		<div className="h-full flex flex-col">
			<div className="py-4 bg-white border-b border-base-300 flex-none">
				<div className="px-4">
					<SearchTextInput onChange={setSearchText} loading={teasQuery.isPending} />
				</div>
				{/*<ul className="overflow-y-auto flex gap-x-2 px-4 mt-4">*/}
				{/*	<li>*/}
				{/*		<button className="btn" disabled>*/}
				{/*			Origin*/}
				{/*		</button>*/}
				{/*	</li>*/}
				{/*	<li>*/}
				{/*		<button className="btn" disabled>*/}
				{/*			Type*/}
				{/*		</button>*/}
				{/*	</li>*/}
				{/*</ul>*/}
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
		</div>
	);
}
