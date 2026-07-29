import clsx from "clsx";
import type { PropsWithChildren } from "react";
import { Spinner } from "~/shared/components/Spinner";
import { f } from "~/utils/function";

type BtnProps = {
	className?: string;
	onClick?: () => void;
	inline?: boolean;
	small?: boolean;
	disabled?: boolean;
	loading?: boolean;
};

export function Button(props: PropsWithChildren<BtnProps & { defaultClassName?: string }>) {
	function handleClick() {
		if (props.disabled || props.loading) {
			return;
		}

		f(props.onClick)();
	}

	return (
		<button
			className={clsx(
				props.inline ? "inline-flex" : "flex",
				"items-center justify-center select-none",
				"cursor-pointer",
				props.loading && "cursor-wait",
				props.small ? "text-sm px-3 py-1 rounded-lg" : "text-base px-4 py-2 rounded-xl",
				props.defaultClassName ??
					"bg-white text-green-700 hover:bg-green-200 active:bg-green-400 disabled:bg-stone-200 disabled:text-stone-500",
				props.className,
			)}
			onClick={handleClick}
			disabled={props.disabled}
		>
			&nbsp;
			{props.loading && <Spinner className={props.small ? "size-3.5" : "size-4"} />}
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
