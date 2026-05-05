import type { PropsWithChildren } from "react";
import clsx from "clsx";

export function FloatingActions(props: PropsWithChildren<{ className?: string }>) {
	return (
		<div className={clsx("fixed inset-x-4 bottom-18 flex items-center z-40", props.className)}>
			{props.children}
		</div>
	);
}
