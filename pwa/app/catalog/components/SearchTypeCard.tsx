import type { Origin, TeaFamily } from "~t/types";
import clsx from "clsx";
import { Family } from "~/components/tea/Family";
import { Xmark } from "iconoir-react";

export function SearchTypeCard(props: {
	label?: string;
	family: TeaFamily;
	origin?: Origin;
	onClick?: () => void;
	closable?: boolean;
	className?: string;
}) {
	return (
		<article
			className={clsx(
				"rounded-2xl min-h-16 px-4 py-3 flex items-center relative",
				"bg-white text-green-900 text-lg",
				!!props.onClick && "cursor-pointer hover:outline-1 active:bg-green-200 outline-green-400",
				!!props.onClick && "focus:outline-2 focus:outline-green-600",
				props.className,
			)}
			onClick={props.onClick}
			tabIndex={0}
		>
			<div className="flex-1">
				{props.label ? (
					<div className="text-xs font-medium tracking-wide uppercase text-green-800/60">
						<Family family={props.family} iconOnly className="mr-1" />
						{props.family}
					</div>
				) : (
					<Family family={props.family} iconOnly className="mr-2" />
				)}
				<span className="capitalize">{props.label ?? `${props.family} tea`}</span>
			</div>

			<div className="text-sm text-green-800/60">{props.origin && <div>{props.origin.namePath[0]}</div>}</div>

			{props.closable && (
				<button className="absolute top-5.5 right-4" onClick={props.onClick}>
					<Xmark className="size-6 text-stone-500" />
				</button>
			)}
		</article>
	);
}
