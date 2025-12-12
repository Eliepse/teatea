import clsx from "clsx";
import type { ReactNode } from "react";

export function FloatingActionButton(props: {
	className?: string;
	label?: string;
	icon?: ReactNode;
	onClick?: () => void;
}) {
	return (
		<button
			className={clsx(
				"flex items-center justify-center gap-2 text-lg min-w-12 h-12 bg-green-600 text-white rounded-full",
				!!props.label && "px-4",
				"cursor-pointer outline-indigo-700",
				"hover:bg-green-700 focus:outline-2 active:bg-green-800",
				props.className,
			)}
			onClick={props.onClick}
		>
			{props.label}
			{props.icon}
		</button>
	);
}
