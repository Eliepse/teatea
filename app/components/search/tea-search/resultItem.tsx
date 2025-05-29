import type { Tea } from "~t/types";
import Leaf from "~/components/icons/leaf";

export function ResultItem(props: { tea: Tea; onClick?: (tea: Tea) => void }) {
	const hasName = !!props.tea.name;

	// const typePath = props.tea.type.slice(0, hasName ? 0 : -1);

	function onClick(e: MouseEvent) {
		e.stopPropagation();

		if (props.onClick) {
			props.onClick(props.tea);
		}
	}

	return (
		<div className="flex px-4 py-2 border-t border-base-300 items-center">
			<div className="flex-1">
				{/*{0 !== typePath.length && <div>{typePath.map((t) => t.name).join(" · ")}</div>}*/}
				{/*<div>{props.tea.name ?? props.tea.type.slice(-1)[0]?.name}</div>*/}
				{hasName && <div className="text-xs text-base-content/50 mb-1">{props.tea.type.name}</div>}
				<div className="font-semibold">{props.tea.name ?? props.tea.type.name}</div>
			</div>
			<div className="text-right text-xs">
				{/*{!!props.tea.origin?.length && <div>{props.tea.origin.map((t) => t.name).join(" · ")}</div>}*/}
				{!!props.tea.origin && <div className="mb-1">{props.tea.origin.name}</div>}
				{!!props.tea.cultivar && (
					<div className="text-base-content/50">
						{props.tea.cultivar.name} <Leaf className="size-3 text-green-400 inline" />
					</div>
				)}
			</div>
		</div>
	);
}
