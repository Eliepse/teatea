import type { PropsWithChildren } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";

export function ConfirmPopup(props: PropsWithChildren<{ title?: string; onConfirm: () => void, onCancel: () => void }>) {
	return (
		<article
			className="bg-white text-base-content rounded-lg w-full max-w-md pointer-events-auto"
			onClick={(e) => e.stopPropagation()}
		>
			<header className="relative px-4 pt-3 pb-2">
				<h2 className="text-sm text-base-content/70 mr-8">{props.title}</h2>
			</header>

			<div className="p-4 pt-3 text-lg">{props.children}</div>

			<div className="flex gap-2 p-2 mt-4">
				<button className="btn btn-outline btn-lg flex-1" onClick={handleUIEvent(props.onCancel)}>
					No
				</button>
				<button className="btn btn-primary btn-lg btn- flex-1" onClick={handleUIEvent(props.onConfirm)}>
					Yes
				</button>
			</div>
		</article>
	);
}
