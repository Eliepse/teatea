import type { PropsWithChildren, ReactNode } from "react";
import clsx from "clsx";

export function Badge(props: PropsWithChildren<{ icon?: ReactNode; className?: string; loading?: boolean }>) {
	return (
		<div
			className={clsx(
				"inline-flex items-center px-2.5 h-8",
				"bg-white border border-green-100 text-sm rounded-full whitespace-nowrap",
				props.className,
			)}
		>
			{props.icon && <span className="inline-block mr-2">{props.icon}</span>}
			{true === props.loading ? <span className="skeleton h-3 w-16" /> : props.children}
		</div>
	);
}
