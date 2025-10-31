import type { TeaFamily } from "~t/types";
import Leaf from "~/components/icons/leaf";
import clsx from "clsx";

const ICON_COLOR = {
	yellow: "text-lime-200",
	white: "text-cyan-200",
	green: "text-green-300",
	wulong: "text-indigo-300",
	black: "text-orange-400",
	fermented: "text-stone-500",
} as const;

export function Family(props: { family: TeaFamily; iconLast?: boolean; iconOnly?: boolean; className?: string }) {
	const leaf = <Leaf className={clsx("size-[.75em]", ICON_COLOR[props.family])} />;
	const text = !props.iconOnly && <span className={props.iconLast ? "mr-1" : "ml-1"}>{props.family}</span>;

	return (
		<span className={clsx("inline-flex items-center", props.className)}>
			{props.iconLast ? text : leaf}
			{props.iconLast ? leaf : text}
		</span>
	);
}
