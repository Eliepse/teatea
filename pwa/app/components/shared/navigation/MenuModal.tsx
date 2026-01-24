import { Children, type PropsWithChildren, type ReactNode } from "react";
import { Modal } from "~/components/shared/modal/Modal";
import clsx from "clsx";
import { handleUIEvent } from "~/utils/function";

const ItemCls = {
	default: "text-green-950 cursor-pointer hover:bg-green-100 active:bg-green-200 focus:bg-green-100",
	danger: "text-red-600 cursor-pointer hover:bg-red-100 active:bg-red-200 focus:bg-red-100",
} as const;

export function MenuModal(props: PropsWithChildren<{ open: boolean; onClose: () => void }>) {
	return (
		<Modal onClose={props.onClose} open={props.open} className="p-0 text-lg">
			<ul aria-live="polite">
				{Children.map(props.children, (child) => (
					<li className="not-first:border-t border-teal-200">{child}</li>
				))}
			</ul>
		</Modal>
	);
}

export function MenuItem(props: {
	danger?: boolean;
	label: ReactNode;
	onClick: () => void;
	disabled?: boolean;
	icon?: ReactNode;
}) {
	return (
		<button
			className={clsx(
				"flex items-center w-full pl-6 pr-8 h-16",
				"disabled:text-stone-500 disabled:bg-stone-50",
				!props.disabled && ItemCls[props.danger ? "danger" : "default"],
				// 0 === i && "pt-1 h-17",
			)}
			onClick={handleUIEvent(props.onClick)}
			disabled={props.disabled}
		>
			{props.label}
			{!!props.icon && <span className="ml-auto">{props.icon}</span>}
		</button>
	);
}
