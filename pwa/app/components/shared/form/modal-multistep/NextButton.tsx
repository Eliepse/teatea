import { ArrowRight, RefreshDouble } from "iconoir-react";
import { handleUIEvent } from "~/utils/function";
import clsx from "clsx";

export function NextButton(props: {
	disabled?: boolean;
	onClick?: () => void;
	loading?: boolean;
	label?: string;
	loadingText?: string;
	className?: string;
}) {
	return (
		<button
			className={clsx(
				"px-5 py-3 w-full text-lg flex items-center justify-center gap-3",
				"bg-green-600 text-white rounded-xl outline-green-900 cursor-pointer",
				"hover:bg-green-700 active:bg-green-900 focus:outline-2",
				"disabled:bg-stone-100 disabled:text-stone-400",
				props.className,
			)}
			onClick={handleUIEvent(props.onClick)}
			disabled={props.disabled}
		>
			{props.loading ? props.loadingText : props.label}
			{props.loading ? <RefreshDouble className="size-5 animate-spin" /> : <ArrowRight className="size-5 ml-1" />}
		</button>
	);
}
