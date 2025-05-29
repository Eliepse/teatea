import type { Tea } from "~t/types";
import Leaf from "~/components/icons/leaf";

export function ResultItem(props: { tea: Tea; onClick?: (tea: Tea) => void }) {
	const hasName = !!props.tea.name;
	const types = props.tea.parentTypes;
	const origins = props.tea.origin ? [...props.tea.parentOrigins, props.tea.origin].slice(0, 2) : [];

	function handleClick(e: MouseEvent) {
		e.stopPropagation();

		if (props.onClick) {
			props.onClick(props.tea);
		}
	}

	return (
		<div className="flex px-4 py-2 border-t border-base-300 items-center" onClick={handleClick}>
			<div className="flex-1">
				{0 !== props.tea.parentTypes.length && (
					<div className="text-xs text-base-content/50 mb-1">
						{props.tea.parentTypes.map((t) => t.name).join(" · ")}
					</div>
				)}
				<div className="font-semibold">{props.tea.name ?? props.tea.type.name}</div>
			</div>
			<div className="text-right text-xs">
				{0 !== origins.length && <div className="mb-1">{origins.map((t) => t.name).join(" · ")}</div>}
				<div className="text-base-content/50">
					&nbsp;
					{!!props.tea.cultivar && (
						<>
							{props.tea.cultivar.name} <Leaf className="size-3 text-green-400 inline" />
						</>
					)}
				</div>
			</div>
		</div>
	);
}
