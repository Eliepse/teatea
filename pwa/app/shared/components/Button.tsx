import clsx from "clsx";
import { Fragment, type PropsWithChildren, type ReactNode, type MouseEvent } from "react";
import { Spinner } from "~/shared/components/Spinner";
import { f } from "~/utils/function";

type BtnProps = {
	icon?: ReactNode;
	className?: string;
	onClick?: (event: MouseEvent) => void;
	inline?: boolean;
	small?: boolean;
	disabled?: boolean;
	loading?: boolean;
};

export function Button(props: PropsWithChildren<BtnProps & { defaultClassName?: string }>) {
	const iconOnly = !!props.icon && !props.children;

	function handleClick(e: MouseEvent) {
		if (props.disabled || props.loading) {
			return;
		}

		f(props.onClick)(e);
	}

	return (
		<button
			className={clsx(
				props.inline ? "inline-flex" : "flex",
				"items-center justify-center select-none",
				"cursor-pointer",
				props.loading && "cursor-wait",
				props.small ? "text-sm rounded-lg" : "text-base rounded-xl",
				props.small ? (iconOnly ? "p-1" : "px-3 py-1") : iconOnly ? "p-2" : "px-4 py-2",
				props.defaultClassName ??
					"bg-white text-green-700 hover:bg-green-200 active:bg-green-400 disabled:bg-stone-200 disabled:text-stone-500",
				props.className,
			)}
			onClick={handleClick}
			disabled={props.disabled}
		>
			{props.loading && (
				<Fragment>
					&nbsp;
					<Spinner className={props.small ? "size-3.5" : "size-4"} />
				</Fragment>
			)}
			{!props.loading && props.icon}
			{!props.loading && props.children}
		</button>
	);
}

export function PrimaryButton(props: PropsWithChildren<BtnProps>) {
	return (
		<Button
			{...props}
			defaultClassName="bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:bg-stone-200 disabled:text-stone-500"
		/>
	);
}

export function SecondaryButton(props: PropsWithChildren<BtnProps>) {
	return (
		<Button
			{...props}
			defaultClassName="border border-green-200 bg-white text-green-700 hover:bg-green-200 active:bg-green-400 disabled:bg-stone-200 disabled:text-stone-500"
		/>
	);
}

export function DashedButton(props: PropsWithChildren<BtnProps>) {
	return (
		<Button
			{...props}
			defaultClassName={clsx(
				"border border-dashed border-green-600 text-green-700",
				!props.disabled && "hover:bg-green-200 active:bg-green-400",
				"disabled:text-stone-400 disabled:border-stone-300 disabled:cursor-not-allowed",
			)}
		/>
	);
}

export function GhostButton(props: PropsWithChildren<BtnProps>) {
	return (
		<Button
			{...props}
			defaultClassName={clsx(
				"border border-transparent text-stone-600 hover:text-stone-800",
				!props.disabled && "hover:bg-stone-100 active:bg-stone-200",
				"disabled:text-stone-400 disabled:cursor-not-allowed",
			)}
		/>
	);
}
