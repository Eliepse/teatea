import type { TeaFamily } from "~t/types";
import Leaf from "~/components/icons/leaf";
import clsx from "clsx";

const ICON_COLOR = {
	yellow: "text-lime-200",
	white: "text-cyan-200",
	green: "text-green-300",
	wulong: "text-indigo-300",
	black: "text-orange-300",
	fermented: "text-stone-500",
} as const;

export function Family(props: { family: TeaFamily; iconOnly?: boolean; className?: string }) {
	return (
		<span className={clsx("inline-flex items-center", props.className)}>
			<Leaf className={clsx("size-[.75em]", ICON_COLOR[props.family])} />
			{!props.iconOnly && <span className="ml-1">{props.family}</span>}
		</span>
	);
}
