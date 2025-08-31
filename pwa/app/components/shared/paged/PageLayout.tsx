import clsx from "clsx";
import type { BaseSyntheticEvent, PropsWithChildren, ReactNode } from "react";
import Arrow from "~/components/icons/arrow";

export function PageLayout(
	props: PropsWithChildren<{
		title: string;
		onBack?: false | (() => void);
		action?: ReactNode;
		withoutPadding?: boolean;
		className?: string;
		bodyClassName?: string;
	}>,
) {
	function handleBack(e: BaseSyntheticEvent) {
		e.stopPropagation();
		e.preventDefault();
		if(props.onBack) {
			props.onBack()
		}
	}

	return (
		<div className={clsx("flex flex-col h-dvh", props.className)}>
			<div className="flex-none border-b border-base-300">
				{!!props.onBack && (
					<button className="btn btn-ghost pl-4 mt-2" onClick={handleBack}>
						<Arrow direction="left" className="size-4" />
					</button>
				)}

				<h2 className="px-4 pb-4 mt-2 text-lg text-base-content">{props.title}</h2>
			</div>

			<div className={clsx(!props.withoutPadding && "p-4", "flex-1 overflow-y-auto", props.bodyClassName)}>
				{props.children}
			</div>

			{props.action && <div className="flex p-4 border-t border-gray-200">{props.action}</div>}
		</div>
	);
}
