import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { type ChangeEvent, useEffect, useState } from "react";
import clsx from "clsx";
import { handleUIEvent } from "~/utils/function";
import { useQuery } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiCollection, Tea } from "~t/types";
import { CreateTeaButton } from "~/components/tea/CreateTeaButton";
import { TeaShortCard } from "~/components/tea/TeaShortCard";

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
					<SearchInput onChange={setSearchText} loading={teasQuery.isPending} />
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

function SearchInput(props: {
	defaultValue?: string | undefined;
	onChange: (value: string | undefined) => void;
	disabled?: boolean;
	debounceDelayMs?: number;
	loading?: boolean;
}) {
	const [value, setValue] = useState(props.defaultValue?.trim() ?? "");
	const isFilled = 0 !== value.trim().length;

	function clear() {
		setValue("");
		// Don't wait for debounce
		props.onChange(undefined);
	}

	function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
		setValue(e.currentTarget.value);
	}

	// Prevents too many requests (debounce)
	useEffect(() => {
		const timeout = setTimeout(() => {
			const cleanValue = value.trim();
			props.onChange(0 === cleanValue.length ? undefined : cleanValue);
		}, props.debounceDelayMs ?? 350);
		return () => clearTimeout(timeout);
	}, [props.onChange, props.debounceDelayMs, value]);

	return (
		<div className={clsx("input w-full", isFilled && "pr-0")}>
			<MagnifyingGlassIcon className="size-4 text-base-content/40 flex-none" />

			<input placeholder="Search" value={value} onChange={handleInputChange} disabled={props.disabled} />

			{props.loading && (
				<svg className="h-4 w-4 flex-none text-gray-400 animate-spin" viewBox="0 0 16 16">
					<circle
						cx={8}
						cy={8}
						r={6}
						fill="none"
						stroke="currentcolor"
						strokeWidth={2}
						strokeDasharray="27 13"
					/>
				</svg>
			)}

			{isFilled && !props.disabled && (
				<button className="h-full px-4 flex-none" onClick={handleUIEvent(() => props.onChange(undefined))}>
					<XCircleIcon className="size-4 cursor-pointer opacity-60 hover:opacity-100 active:opacity-100" />
				</button>
			)}
		</div>
	);
}
