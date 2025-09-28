import { PageLayout } from "~/components/shared/paged/PageLayout";
import { type Origin } from "~t/types";
import { useMemo, useState } from "react";
import clsx from "clsx";
import Chevron from "~/components/icons/chevron";
import { useOriginByPath } from "~/utils/api/useOrigins";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";

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
		defaultValue?: Origin;
	} & (
		| { onSelect: (value?: Origin) => void; allowToggle: true }
		| { onSelect: (value: Origin) => void; allowToggle?: false }
	),
) {
	const { data, isLoading } = useOriginByPath({ sort: "popularity" });
	const [selected, setSelected] = useState(props.defaultValue);

	const isLeaf = selected && data ? data[selected.path]?.isLeaf : true;
	const displayedParent = selected ? (isLeaf && data ? getOriginParent(data, selected) : selected) : undefined;
	const displayedParentNodes = displayedParent?.path?.split(".");

	const originList = useMemo(() => {
		const search = displayedParent?.path;
		const level = (displayedParent?.path?.split(".")?.length ?? 0) + 1;
		return Object.entries(data ?? [])
			.filter(([k, node]) => node.path?.split(".")?.length === level && (undefined === search || k.startsWith(`${search}.`)))
			.map(([_, o]) => o);
	}, [data, displayedParent]);

	function back() {
		if (!selected || !data) {
			props.onBack();
			return;
		}

		const parentPath = selected.path.split(".").slice(0, -1).join(".");
		const parent = data[parentPath];

		if (0 === parentPath.length) {
			setSelected(undefined);
			return;
		}

		if (!parent) {
			setSelected(undefined);
			console.warn(`Failed to find the parent origin of ${parentPath}`);
			return;
		}

		setSelected(parent);
	}

	function changeOrigin(origin: Origin): void {
		if (true === props.allowToggle) {
			setSelected((st) => (origin.path === st?.path ? undefined : origin));
			return;
		}

		setSelected(origin);
	}

	function confirm() {
		if(true === props.allowToggle) {
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
					disabled={true !== props.allowToggle && !selected}
				>
					Next
					<ArrowRightIcon className="size-4" />
				</button>
			}
		>
			{isLoading && "Loading..."}

			{!isLoading && displayedParent && (
				<OriginItem
					label={displayedParent.name}
					selected={displayedParent === selected}
					onSelect={() => changeOrigin(displayedParent)}
				/>
			)}

			{!isLoading && displayedParent && (
				<div className="text-xs text-base-content/60 my-4 uppercase">
					{displayedParent && 1 === displayedParentNodes?.length && "Regions"}
					{displayedParent && 2 === displayedParentNodes?.length && "Localities"}
				</div>
			)}

			{originList.map((origin) => (
				<OriginItem
					key={origin.path}
					label={origin.name}
					selected={selected?.path === origin.path}
					hasChildren={!origin.isLeaf}
					onSelect={() => changeOrigin(origin)}
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
