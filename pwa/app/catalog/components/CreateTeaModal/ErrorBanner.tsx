import type { PropsWithChildren } from "react";
import clsx from "clsx";
import { XmarkCircleSolid } from "iconoir-react";

export function ErrorBanner(props: PropsWithChildren<{ className?: string }>) {
	return (
		<div
			className={clsx(
				"flex-none flex items-center text-center rounded-lg px-3 py-2 text-sm",
				"bg-red-200 text-red-800",
				props.className,
			)}
		>
			<p>
				<XmarkCircleSolid className="inline size-4 mr-2 mb-0.5" /> {props.children}
			</p>
		</div>
	);
}
