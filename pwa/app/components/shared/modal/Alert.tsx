import type { PropsWithChildren } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";

export function Alert(props: PropsWithChildren<{ title?: string; onClose: () => void }>) {
	return (
		<article className="bg-white text-base-content rounded-lg w-full max-w-md">
			<header className="relative px-4 pt-3 pb-2">
				<h2 className="text-sm text-base-content/70 mr-8">{props.title}</h2>
				<button className="absolute top-0 right-0 p-3" onClick={handleUIEvent(props.onClose)}>
					<XMarkIcon className="size-4" />
				</button>
			</header>

			<div className="p-4 pt-3">{props.children}</div>
		</article>
	);
}
