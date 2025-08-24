import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { type ChangeEvent, useState } from "react";
import clsx from "clsx";
import { handleUIEvent } from "~/utils/function";
import { useQuery } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiCollection, OriginPath, Tea } from "~t/types";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import { CreateTeaButton } from "~/components/tea/CreateTeaButton";

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
					<SearchInput value={searchText} onChange={setSearchText} />
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
						<div className="uppercase text-xs text-base-content/60">
							{teasQuery.data.totalItems} results
						</div>
						<ul className="mt-2">
							{teasQuery.data.member?.map((tea) => (
								<li key={tea.id}>
									<TeaItem
										title={tea.displayName}
										family={tea.family + " tea"}
										type={tea.type?.name}
										originPath={tea.originPath}
										onSelect={() => props.onSelect(tea)}
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
	value: string | undefined;
	onChange: (value: string | undefined) => void;
	disabled?: boolean;
}) {
	const isFilled = 0 !== (props.value?.trim()?.length ?? 0);

	function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
		const value = e.currentTarget.value;

		if (0 === value.trim().length) {
			return props.onChange(undefined);
		}

		props.onChange(value);
	}

	return (
		<div className={clsx("input w-full", isFilled && "pr-0")}>
			<MagnifyingGlassIcon className="size-4 text-base-content/40 flex-none" />
			<input
				placeholder="Search"
				value={props.value ?? ""}
				onChange={handleInputChange}
				disabled={props.disabled}
			/>
			{isFilled && !props.disabled && (
				<button className="h-full px-4 flex-none" onClick={handleUIEvent(() => props.onChange(undefined))}>
					<XCircleIcon className="size-4 cursor-pointer opacity-60 hover:opacity-100 active:opacity-100" />
				</button>
			)}
		</div>
	);
}

function TeaItem(props: {
	title: string;
	onSelect: () => void;
	selected?: boolean;
	className?: string;
	originPath?: OriginPath;
	family: string;
	type?: string;
}) {
	return (
		<article
			className={clsx(
				"bg-base-200 rounded px-4 py-3 h-16 flex items-center",
				props.selected && "bg-primary text-white",
				props.className,
			)}
			onClick={props.onSelect}
		>
			<div className="flex-1">{props.title}</div>
			<div className="text-xs text-right">
				{<div>{props.type ? props.family : ""}</div>}
				{props.originPath && <FormatOriginPath originPath={props.originPath} />}
			</div>
		</article>
	);
}
