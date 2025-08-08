import { PageLayout } from "~/components/shared/paged/PageLayout";
import { type Origin } from "~t/types";
import { useMemo, useState } from "react";
import clsx from "clsx";
import Chevron from "~/components/icons/chevron";
import { useOriginByPath } from "~/utils/api/useOrigins";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";

function getOriginParent(originMap: { [key: string]: Origin }, node: Origin): Origin | undefined {
	const parentPathNodes = node.path.slice(0, -1);

	if (0 === parentPathNodes.length) {
		return undefined;
	}

	return originMap[parentPathNodes.join(".")] ?? undefined;
}

export function SelectOrigin(props: { onSelect: (value: Origin) => void; onBack: () => void; defaultValue?: Origin }) {
	const { data, isLoading } = useOriginByPath();
	const [selected, setSelected] = useState(props.defaultValue);
	const leavesPaths = useMemo(() => {
		const paths = Object.keys(data ?? {});
		return paths.filter((key) => !paths.some((path) => path.startsWith(`${key}.`)));
	}, [data]);

	const isLeaf = selected ? leavesPaths.includes(selected.path.join(".")) : true;
	const displayedParent = selected ? (isLeaf && data ? getOriginParent(data, selected) : selected) : undefined;

	const originList = useMemo(() => {
		const search = displayedParent?.path?.join(".");
		const level = (displayedParent?.path?.length ?? 0) + 1;
		return Object.entries(data ?? [])
			.filter(([k, node]) => node.path.length === level && (undefined === search || k.startsWith(`${search}.`)))
			.map(([_, o]) => o);
	}, [data, displayedParent]);

	function back() {
		if (!selected || !data) {
			props.onBack();
			return;
		}

		const parentPath = selected.path.slice(0, -1).join(".");
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
		setSelected(origin);
	}

	function confirm() {
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
				<button className="ml-auto btn btn-primary" onClick={confirm} disabled={!selected}>
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
					{displayedParent && 1 === displayedParent.path.length && "Regions"}
					{displayedParent && 2 === displayedParent.path.length && "Localities"}
				</div>
			)}

			{originList.map((origin) => (
				<OriginItem
					key={origin.id}
					label={origin.name}
					selected={selected?.id === origin.id}
					hasChildren={!leavesPaths.includes(origin.path.join("."))}
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
