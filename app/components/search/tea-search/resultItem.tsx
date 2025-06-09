import type { Tea } from "~t/types";
import { type MouseEvent } from "react";
import { TeaCard } from "~/components/shared/TeaCard";

export function ResultItem(props: { tea: Tea; onClick?: (tea: Tea) => void; selected?: boolean }) {
	const origins = props.tea.origin ? [...(props.tea.parentOrigins ?? []), props.tea.origin] : [];

	function handleClick(e: MouseEvent) {
		e.stopPropagation();

		if (props.onClick) {
			props.onClick(props.tea);
		}
	}

	return (
		<div className="border-t border-base-300 cursor-pointer select-none" onClick={handleClick}>
			<TeaCard
				typePath={[...props.tea.parentTypes.slice(1), props.tea.type]}
				originPath={origins}
				name={props.tea.name}
				cultivar={props.tea.cultivar}
				selected={props.selected}
			/>
		</div>
	);
}
