import clsx from "clsx";
import type { ReactNode } from "react";

export function FloatingActionButton(props: {
	className?: string;
	label?: string;
	icon?: ReactNode;
	onClick?: () => void;
	disabled?: boolean;
}) {
	return (
		<button
			className={clsx(
				"flex items-center justify-center gap-2 text-lg min-w-12 h-12 rounded-full",
				!!props.label && "px-4",
				"cursor-pointer outline-indigo-700",
				!props.disabled && "bg-green-600 text-white",
				!props.disabled && "hover:bg-green-700 focus:outline-2 active:bg-green-800",
				props.disabled && "bg-stone-300 text-stone-700",
				props.className,
			)}
			onClick={props.onClick}
			disabled={props.disabled}
		>
			{props.label}
			{props.icon}
		</button>
	);
}
