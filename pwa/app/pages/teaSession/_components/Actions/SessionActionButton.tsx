import { type PropsWithChildren } from "react";
import clsx from "clsx";
import { EditPencil } from "iconoir-react";

const CLS = {
	root: "relative w-full min-h-full p-4 flex flex-col items-center gap-1.5 text-sm rounded-lg border",
	empty: "border-dashed border-green-600 text-green-700",
	editable: "cursor-pointer hover:bg-green-300 active:bg-green-400",
	filled: "bg-white text-green-900 shadow-sm border-stone-100",
};

export function SessionActionButton(
	props: PropsWithChildren<{ filled?: boolean; onClick?: () => void; readonly?: boolean; className?: string }>,
) {
	const styles = clsx(CLS.root, {
		[CLS.empty]: !props.filled,
		[CLS.editable]: !props.readonly,
		[CLS.filled]: props.filled,
	});

	if (props.readonly) {
		return <div className={clsx(styles, props.className)}>{props.children}</div>;
	}

	return (
		<button className={clsx(styles, props.className)} onClick={props.onClick}>
			{props.filled && <EditPencil className="absolute top-1.5 right-1.5 text-stone-400 size-4" />}
			{props.children}
		</button>
	);
}
