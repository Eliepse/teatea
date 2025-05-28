import { Fragment, type MouseEvent, useState } from "react";
import Chevron from "~/components/icons/chevron";
import clsx from "clsx";

interface Node {
	id: number;
	name: string;
	children?: Node[];
}

function listChildrenIdRecursive(types: Node[]): number[] {
	const ids: number[] = [];

	types.forEach((type) => {
		ids.push(type.id);

		if (type.children?.length) {
			ids.push(...listChildrenIdRecursive(type.children));
		}
	});

	return ids;
}

export function MultilevelSelect(props: { types: Node[]; value: Node[]; onChange: (value: Node[]) => void }) {
	const [navPath, setNavPath] = useState<Node[]>([]);
	const selectedIds = props.value.map((node) => node.id);
	const previousNode = navPath.slice(-2)[0] ?? null;
	const currentNode = navPath.slice(-1)[0] ?? null;

	function toggleNode(type: Node): void {
		const isSelected = selectedIds.includes(type.id);

		if (isSelected) {
			props.onChange(props.value.filter((node) => node.id !== type.id));
			return;
		}

		const typesToExclude = listChildrenIdRecursive(type.children ?? []);
		props.onChange([...props.value.filter((t) => false === typesToExclude.includes(t.id)), type]);
	}

	function back(e?: MouseEvent) {
		e?.stopPropagation();
		e?.preventDefault();

		setNavPath((path) => path.slice(0, -1));
	}

	function navigate(type: Node) {
		setNavPath((path) => [...path, type]);
	}

	return (
		<div>
			{null !== currentNode && (
				<button className="btn btn-ghost pl-0 justify-start leading-none mb-2" onClick={back}>
					<Chevron direction="left" className="size-5" />
					Back
				</button>
			)}

			<div className="py-2 bg-white text-sm uppercase text-base-content/40 static top-0">
				{navPath.map((node, i) => (
					<Fragment key={node.id}>
						{0 !== i && <> &middot; </>}
						{node.name}
					</Fragment>
				))}
			</div>

			{/* Select parent type */}
			{null !== currentNode && (
				<NodeBtn
					className="mb-4"
					name="All"
					type="input"
					selected={selectedIds.includes(currentNode.id)}
					onToggle={() => toggleNode(currentNode)}
				/>
			)}

			<div className="join join-vertical block">
				{(currentNode?.children ?? props.types).map((node) => (
					<NodeBtn
						key={node.id}
						name={node.name}
						selected={selectedIds.includes(node.id)}
						type={!!node.children?.length ? "nav" : "input"}
						onNavigate={() => navigate(node)}
						onToggle={() => toggleNode(node)}
						className="join-item"
					/>
				))}
			</div>
		</div>
	);
}

function NodeBtn(props: {
	name: string;
	selected: boolean;
	type: "nav" | "input";
	onToggle?: () => void;
	onNavigate?: () => void;
	className?: string;
}) {
	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();

		const action = "nav" === props.type ? props.onNavigate : props.onToggle;

		if (action) {
			action();
		}
	}

	return (
		<label
			className={clsx("btn btn-block h-12 justify-between leading-none", props.className)}
			onClick={handleClick}
		>
			{props.name}
			{"input" === props.type && (
				<input className="checkbox checkbox-sm" type="checkbox" checked={props.selected} readOnly />
			)}

			{"nav" === props.type && <Chevron direction="right" className="size-5" />}
		</label>
	);
}
