import type { PropsWithChildren, ReactNode } from "react";
import clsx from "clsx";

const COLORS = {
	white: "bg-white border-green-100 text-green-800",
	lightGreen: "bg-green-100 border-green-100 text-green-800",
	primary: "bg-green-600 border-green-600 text-white"
} as const;

export function Badge(
	props: PropsWithChildren<{
		color?: keyof typeof COLORS;
		icon?: ReactNode;
		className?: string;
		loading?: boolean;
		small?: boolean;
	}>,
) {
	return (
		<div
			className={clsx(
				"inline-flex items-center leading-none",
				props.small ? "px-2 h-6 text-sm" : "px-2.5 h-8",
				"border text-sm rounded-full whitespace-nowrap",
				COLORS[props.color ?? "white"],
				props.className,
			)}
		>
			{props.icon && (
				<span className={clsx("inline-block", props.small ? "mt-0.5 mr-1" : "mr-2")}>{props.icon}</span>
			)}
			{true === props.loading ? <span className="skeleton h-3 w-16" /> : props.children}
		</div>
	);
}
