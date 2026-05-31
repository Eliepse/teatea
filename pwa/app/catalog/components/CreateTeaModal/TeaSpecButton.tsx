import clsx from "clsx";
import type { ReactNode } from "react";
import { EditPencil } from "iconoir-react";

export function TeaSpecButton(props: {
	icon: ReactNode;
	label: ReactNode;
	onClick: () => void;
	filled?: boolean;
	readonly?: boolean;
}) {
	function handleClick() {
		if (props.readonly) {
			return;
		}

		props.onClick();
	}

	return (
		<button
			className={clsx(
				"relative w-full h-24 p-4 flex flex-col items-center justify-center gap-1.5 text-sm rounded-lg border",
				!props.filled && "border-dashed border-green-600 text-green-700",
				!props.readonly && "cursor-pointer hover:bg-green-300 active:bg-green-400",
				props.filled && "bg-green-100 text-green-900 border-green-100",
			)}
			onClick={handleClick}
		>
			{props.filled && <EditPencil className="absolute top-1.5 right-1.5 text-stone-400 size-4" />}
			{props.icon}
			{props.label}
		</button>
	);
}
