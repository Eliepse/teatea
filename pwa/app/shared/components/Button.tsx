import clsx from "clsx";
import type { PropsWithChildren } from "react";

type BtnProps = { className?: string; onClick?: () => void };

export function Button(props: PropsWithChildren<BtnProps & { defaultClassName?: string }>) {
	return (
		<button
			className={clsx(
				"w-full flex items-center justify-center px-4 py-2 rounded-xl select-none",
				"cursor-pointer disabled:bg-stone-200 disabled:text-stone-500",
				props.defaultClassName ?? "bg-white text-green-700 hover:bg-green-200 active:bg-green-400",
				props.className,
			)}
			onClick={props.onClick}
		>
			{props.children}
		</button>
	);
}

export function PrimaryButton(props: PropsWithChildren<BtnProps>) {
	return <Button {...props} defaultClassName="bg-green-600 text-white hover:bg-green-700 active:bg-green-800" />;
}

export function SecondaryButton(props: PropsWithChildren<BtnProps>) {
	return (
		<Button
			{...props}
			defaultClassName="border border-green-200 bg-white text-green-700 hover:bg-green-200 active:bg-green-400"
		/>
	);
}
