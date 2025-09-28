import { PageLayout } from "~/components/shared/paged/PageLayout";
import { type ApiCollection, type Origin } from "~t/types";
import { useState } from "react";
import clsx from "clsx";
import Chevron from "~/components/icons/chevron";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";
import { useQuery } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import { getParentPath, useOrigin } from "~/utils/api/useOrigins";

function getOriginParent(originMap: { [key: string]: Origin }, node: Origin): Origin | undefined {
	const parentPathNodes = node.path.split(".").slice(0, -1);

	if (0 === parentPathNodes.length) {
		return undefined;
	}

	return originMap[parentPathNodes.join(".")] ?? undefined;
}

export function SelectOrigin(
	props: {
		onBack: () => void;
		defaultOriginPath?: Origin["path"];
	} & (
		| { onSelect: (value?: Origin) => void; allowToggle: true }
		| { onSelect: (value: Origin) => void; allowToggle?: false }
	),
) {
	// Path of the parent of the displayed origins
	const [viewPath, setViewPath] = useState(getParentPath(props.defaultOriginPath));
	const { data: viewOrigin, ...viewOriginQuery } = useOrigin(viewPath);
	const viewOriginLevel = viewOrigin?.path?.split(".")?.length ?? 0;

	// Path of the currently selected origin
	const [selectionPath, setSelectionPath] = useState(props.defaultOriginPath);
	const { data: origins, isLoading } = useQuery({
		queryFn: async (ctx) => {
			const queryKey = ctx.queryKey[1] ?? null;
			const params = typeof queryKey === "string" ? { parent: undefined } : queryKey;
			const parentLevel = params.parent?.split(".")?.length ?? 0;

			const filters = {
				parent: params.parent,
				// Fetch children, but never lower than localities
				level: Math.min(parentLevel + 1, 3),
			};

			const data = await (await getApi<ApiCollection<Origin>>("/origins", filters)).json();
			return data.member;
		},
		queryKey: ["origins", { parent: viewPath }],
	});
	const { data: popularOrigins, ...popularsQuery } = useQuery({
		queryFn: async (ctx) => {
			const queryKey = ctx.queryKey[2] ?? null;
			const params = typeof queryKey === "string" ? { limit: 3 } : queryKey;
			const filters = {
				...params,
				sort: "popularity",
				level: 1,
			};
			const data = await (await getApi<ApiCollection<Origin>>("/origins", filters)).json();
			return data.member;
		},
		queryKey: ["origins", "populars", { limit: 3 }],
		enabled: undefined === viewPath,
	});

	function back() {
		if (undefined === viewPath) {
			props.onBack();
			return;
		}

		setSelectionPath(undefined);
		setViewPath((st) => {
			const parentNodes = st?.split(".")?.slice(0, -1) ?? [];
			return 0 === parentNodes.length ? undefined : parentNodes.join(".");
		});
	}

	function changePath(origin: Origin): void {
		setSelectionPath((st) => (props.allowToggle && origin.path === st ? undefined : origin.path));
		setViewPath((st) => {
			if (origin.isLeaf) {
				return st;
			}

			return origin.path;
		});
	}

	function confirm() {
		const selected = origins?.find((o) => o.path === selectionPath);

		if (true === props.allowToggle) {
			props.onSelect(selected);
			return;
		}

		if (!selected) {
			console.warn("Can't submit: no origin selected!");
			return;
		}

		props.onSelect(selected);
	}

	return (
		<PageLayout
			title="Where does it come from?"
			onBack={back}
			bodyClassName="pb-20"
			action={
				<button
					className="ml-auto btn btn-primary"
					onClick={confirm}
					disabled={true !== props.allowToggle && !selectionPath}
				>
					Next
					<ArrowRightIcon className="size-4" />
				</button>
			}
		>
			{undefined === viewPath && (
				<>
					<div className="text-xs text-base-content/60 mb-4 uppercase">Popular origins</div>
					{popularsQuery.isLoading ? (
						<>
							<div className="skeleton h-14 mb-2" />
							<div className="skeleton h-14 mb-2" />
							<div className="skeleton h-14 mb-2" />
						</>
					) : (
						(popularOrigins ?? []).map((origin) => (
							<OriginItem
								key={origin.path}
								label={origin.name}
								selected={selectionPath === origin.path}
								hasChildren={!origin.isLeaf}
								onSelect={() => changePath(origin)}
							/>
						))
					)}

					<hr className="border-stone-200 mt-2 mb-4" />
				</>
			)}

			{viewOriginQuery.isLoading && <div className="skeleton h-14 mb-2" />}
			{!viewOriginQuery.isLoading && viewOrigin && (
				<OriginItem
					label={viewOrigin.name}
					selected={viewOrigin.path === selectionPath}
					onSelect={() => changePath(viewOrigin)}
				/>
			)}

			{0 !== viewOriginLevel && (
				<div className="text-xs text-base-content/60 my-4 uppercase">
					{1 === viewOriginLevel && "Regions"}
					{2 === viewOriginLevel && "Localities"}
				</div>
			)}

			{isLoading && (
				<>
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
				</>
			)}

			{(origins ?? []).map((origin) => (
				<OriginItem
					key={origin.path}
					label={origin.name}
					selected={selectionPath === origin.path}
					hasChildren={!origin.isLeaf}
					onSelect={() => changePath(origin)}
				/>
			))}
		</PageLayout>
	);
}

function OriginItem(props: { label: string; selected: boolean; hasChildren?: boolean; onSelect: () => void }) {
	return (
		<button
			onClick={handleUIEvent(props.onSelect)}
			className={clsx("mb-2 btn btn-block h-14", props.selected && "btn-primary")}
		>
			<span className="mr-auto">{props.label}</span>
			{props.selected && <CheckIcon className="size-4" />}
			{props.hasChildren && <Chevron direction="right" className="size-4" />}
		</button>
	);
}
