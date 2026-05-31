import clsx from "clsx";
import { Xmark } from "iconoir-react";
import type { ReactNode } from "react";

export function SelectItem(props: {
	label: ReactNode;
	onClick: () => void;
	selected?: boolean;
	allowToggle?: boolean;
}) {
	return (
		<button
			className={clsx(
				"flex items-center h-14 px-4 py-2 btn-block rounded-xl text-left cursor-pointer",
				props.selected && "bg-green-600 text-white hover:bg-green-700 active:bg-green-800",
				!props.selected && "bg-green-100 text-green-900 hover:bg-green-200 active:bg-green-300",
			)}
			onClick={props.onClick}
		>
			{props.label}
			{props.selected && props.allowToggle && <Xmark className="size-6 ml-auto" />}
		</button>
	);
}
