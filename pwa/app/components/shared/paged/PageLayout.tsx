import clsx from "clsx";
import type { PropsWithChildren, ReactNode } from "react";
import Arrow from "~/components/icons/arrow";

export function PageLayout(
	props: PropsWithChildren<{
		title: string;
		onBack: false | (() => void);
		action?: ReactNode;
		withoutPadding?: boolean;
		className?: string;
	}>,
) {
	return (
		<div className="">
			<button className="btn btn-ghost pl-4 mt-2" onClick={props.onBack || undefined} disabled={false === props.onBack}>
				<Arrow direction="left" className="size-4" />
			</button>

			<h2 className="px-4 pb-4 mt-2 border-b border-base-300 text-lg text-base-content">{props.title}</h2>

			<div className={clsx(!props.withoutPadding && "p-4")}>{props.children}</div>

			{props.action && <div className="fixed bottom-4 inset-x-4">{props.action}</div>}
		</div>
	);
}
