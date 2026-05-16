import { type PropsWithChildren } from "react";
import clsx from "clsx";

const CLS = {
	root: "w-full min-h-full p-4 flex flex-col items-center gap-1.5 text-sm rounded-lg",
	empty: "border border-green-600 text-green-700",
	editable: "cursor-pointer",
	emptyEditable: "hover:bg-green-300 active:bg-green-400",
	filled: "bg-white text-green-900 shadow-sm",
	filledEditable: "hover:bg-green-300 active:bg-green-400",
};

export function SessionAction(
	props: PropsWithChildren<{ filled?: boolean; onClick?: () => void; readonly?: boolean; className?: string }>,
) {
	const styles = clsx(CLS.root, {
		[CLS.empty]: !props.filled,
		[CLS.editable]: !props.readonly,
		[CLS.emptyEditable]: !props.readonly && !props.filled,
		[CLS.filled]: props.filled,
		[CLS.filledEditable]: !props.readonly && props.filled,
	});

	if (props.readonly) {
		return <div className={clsx(styles, props.className)}>{props.children}</div>;
	}

	return (
		<button className={clsx(styles, props.className)} onClick={props.onClick}>
			{props.children}
		</button>
	);
}
