import type { ApiCollection, Iri, Origin } from "~t/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import { f, handleUIEvent } from "~/utils/function";
import { type ReactNode, useState } from "react";
import clsx from "clsx";
import { ArrowRight, Xmark } from "iconoir-react";
import styles from "./OriginSelect.module.css";
import { DashedButton } from "~/shared/components/Button";
import { If } from "~/shared/components/Logical/If";
import { CreateOriginModal } from "~/components/origin/CreateOriginModal";
import { type IForm, makeCreateOriginMutation } from "~/utils/command/createOriginMutation";
import { makeOriginQueryOpt } from "~/shared/query/originQuery";

// Un-persisted version of a new origin
export type NewOrigin = IForm & Partial<Pick<Origin, "namePath">>;

export type CreationMode = {
	// Persist immediatly the origin through api
	persist?: boolean;
	onCreated?: (origin?: NewOrigin | Origin) => void;
};

export function OriginSelect(
	props: {
		value?: Iri | NewOrigin;
		// Select the parent node for the list of selectable origins
		onChange: (value?: Iri | NewOrigin) => void;
		filterPath?: string;
		onFilterPathChange?: (value?: Iri) => void;
		allowToggle?: boolean;
		allowCreate?: boolean;
		maxDepth?: number;
		className?: string;
	} & CreationMode,
) {
	const queryClient = useQueryClient();
	const [creating, setCreating] = useState<string | boolean>(false);

	// store parent or "true" for top level
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

	const mutation = useMutation({
		...makeCreateOriginMutation(),
		onSuccess: (origin) => f(props.onCreated)(origin),
	});

	const selected = nodes?.find((o) => props.value === o["@id"]);
	const filterNodes = props.filterPath?.split(".") ?? [];

	function selectOrigin(origin: Origin) {
		if (true === props.allowToggle && origin["@id"] === props.value) {
			props.onChange(undefined);
			return;
		}

		props.onChange(origin["@id"]);
	}

	function handleItemOpenMaker(origin: Origin) {
		if (origin.isLeaf || undefined === props.onFilterPathChange) {
			return undefined;
		}

		if (props.maxDepth && props.maxDepth <= origin.namePath.length) {
			return undefined;
		}

		return () => f(props.onFilterPathChange)(origin.path);
	}

	async function handleSubmitNewOrigin(data: { name: string }) {
		if (!creating) {
			return;
		}

		// Load the parent to setup the "name path"
		let parent: Origin | undefined;
		try {
			if (typeof creating === "string") {
				parent = await queryClient.fetchQuery(makeOriginQueryOpt({ "@id": creating }));
			}
		} catch (_e) {
			console.warn(`Failed to fetch the parent: ${creating}`);
		}

		const payload = {
			...data,
			parent: true !== creating ? creating : undefined,
			namePath: parent?.namePath ? [...parent.namePath, data.name] : undefined,
		} satisfies NewOrigin;

		if (props.persist) {
			await mutation.mutateAsync(payload);
			setCreating(false);
			return;
		}

		f(props.onCreated)(payload);
		setCreating(false);
	}

	return (
		<div className={props.className}>
			<ul>
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
								onOpen={handleItemOpenMaker(origin)}
								allowToggle={props.allowToggle}
							/>
						</li>
					))}
			</ul>

			<If check={props.allowCreate && 3 !== filterNodes.length}>
				<div className="mt-8 flex flex-col gap-2">
					<If check={selected && selected.isLeaf && 2 > filterNodes.length}>
						<DashedButton className="w-full h-15" onClick={() => selected && setCreating(selected["@id"])}>
							Add a {0 === filterNodes.length ? "region" : "locality"} to {selected?.name}
						</DashedButton>
					</If>

					<DashedButton
						className="w-full h-15"
						onClick={() => setCreating(props.filterPath ? `/api/origins/${props.filterPath}` : true)}
					>
						Add a {0 === filterNodes.length ? "country" : "region"}
					</DashedButton>
				</div>

				<CreateOriginModal
					open={!!creating}
					onClose={() => setCreating(false)}
					onConfirm={handleSubmitNewOrigin}
				/>
			</If>
		</div>
	);
}

export function Item(props: {
	label: ReactNode;
	onSelect: () => void;
	validated: boolean;
	selected?: boolean;
	onOpen?: () => void;
	allowToggle?: boolean;
}) {
	return (
		<div className={clsx(styles.btn, props.selected && styles.selected, "w-full")}>
			<button className={clsx(styles.inner, "flex-1")} onClick={handleUIEvent(props.onSelect)}>
				{props.label}
				{props.allowToggle && props.selected && <Xmark className="size-6 ml-auto" />}
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
