import type { ApiCollection, Iri, Origin } from "~t/types";
import { useQuery } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import { f, handleUIEvent } from "~/utils/function";
import { type ReactNode } from "react";
import clsx from "clsx";
import { ArrowRight } from "iconoir-react";
import styles from "./OriginSelect.module.css";

export function OriginSelect(props: {
	value?: Iri;
	// Select the parent node for the list of selectable origins
	onChange: (value?: Iri) => void;
	filterPath?: string;
	onFilterPathChange?: (value?: Iri) => void;
	allowToggle?: boolean;
	className?: string;
}) {
	const allowNested = undefined !== props.onFilterPathChange;
	const { data: nodes, ...nodesQuery } = useQuery({
		queryFn: async (ctx) => {
			const queryKey = ctx.queryKey[1] ?? null;
			const { path } = typeof queryKey === "string" ? { path: undefined } : queryKey;
			const levels = path?.split(".")?.length ?? 0;

			// Fetch children, but never lower than localities
			const res = await getApi<ApiCollection<Origin>>("/origins", {
				parent: path,
				level: Math.min(levels + 1, 3),
			});
			return (await res.json()).member;
		},
		queryKey: ["origins", { path: props.filterPath }],
	});

	function selectOrigin(origin: Origin) {
		if (true === props.allowToggle && origin["@id"] === props.value) {
			props.onChange(undefined);
			return;
		}

		props.onChange(origin["@id"]);
	}

	return (
		<ul className={props.className}>
			{nodesQuery.isPending && (
				<>
					<li className="skeleton h-16 mb-2" />
					<li className="skeleton h-16 mb-2" />
					<li className="skeleton h-16 mb-2" />
					<li className="skeleton h-16 mb-2" />
				</>
			)}
			{!nodesQuery.isPending &&
				nodes?.map((origin) => (
					<li key={origin["@id"]} className="mb-2">
						<Item
							label={origin.name}
							validated={false === origin.proposal}
							onSelect={() => selectOrigin(origin)}
							selected={props.value === origin["@id"]}
							onOpen={
								origin.isLeaf || !allowNested
									? undefined
									: () => f(props.onFilterPathChange)(origin.path)
							}
						/>
					</li>
				))}
		</ul>
	);
}

export function Item(props: {
	label: ReactNode;
	onSelect: () => void;
	validated: boolean;
	selected?: boolean;
	onOpen?: () => void;
}) {
	return (
		<div className={clsx(styles.btn, props.selected && styles.selected, "w-full")}>
			<button className={clsx(styles.inner, "flex-1")} onClick={handleUIEvent(props.onSelect)}>
				{props.label}
			</button>
			{props.onOpen && (
				<button
					className={clsx(styles.inner, "flex-none px-8 border-l border-green-200")}
					onClick={handleUIEvent(props.onOpen)}
				>
					<ArrowRight className="size-4" />
				</button>
			)}
		</div>
	);
}
