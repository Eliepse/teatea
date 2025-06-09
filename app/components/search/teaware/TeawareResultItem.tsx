import type { Teaware } from "~t/types";
import Leaf from "~/components/icons/leaf";
import type { MouseEvent } from "react";
import clsx from "clsx";
import { teawareTypes } from "~t/teawareType";

export function TeawareResultItem(props: { teaware: Teaware; onClick?: (tea: Teaware) => void; selected?: boolean }) {
	function handleClick(e: MouseEvent) {
		e.stopPropagation();

		if (props.onClick) {
			props.onClick(props.teaware);
		}
	}

	return (
		<div
			className={clsx(
				"flex px-4 py-2 border-t border-base-300 items-center cursor-pointer select-none",
				props.selected && "bg-primary text-white",
			)}
			onClick={handleClick}
		>
			<div className="flex-1">
				<div className={clsx("text-xs mb-1", props.selected ? "text-white" : "text-base-content/50")}>
					{teawareTypes[props.teaware.type]}
				</div>
				<div className="font-semibold">{props.teaware.name}</div>
			</div>

			<div className={clsx("text-right text-xs", props.selected ? "text-white" : "text-base-content/50")}>
				{props.teaware.volume && `${props.teaware.volume.ml} ml`}
			</div>
		</div>
	);
}
