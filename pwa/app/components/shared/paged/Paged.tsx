import { createPortal } from "react-dom";
import clsx from "clsx";

export function Paged(props: React.PropsWithChildren<{ open: boolean; className?: string }>) {
	if (false === props.open) {
		return null;
	}

	return createPortal(
		<div className={clsx("fixed inset-0 z-40 bg-base-100 overflow-y-auto", props.className)}>{props.children}</div>,
		document.body,
	);
}
