import { type MouseEvent, useState } from "react";
import { Modal } from "~/components/shared/modal/Modal";
import clsx from "clsx";
import { MultilevelSelect } from "~/components/search/MultilevelSelect";
import type { OriginTreeNode } from "~t/types";

type Origin = { id: number; path: string; name: string; children?: Origin[] };
export type OriginFilterValue = Origin[];

export function OriginFilter(props: {
	origins: OriginTreeNode[];
	value: Origin[];
	onChange: (value: Origin[]) => void;
	disabled?: boolean;
}) {
	const [open, setOpen] = useState(false);

	function onResetClick(e: MouseEvent) {
		e.stopPropagation();
		props.onChange([]);
	}

	function onCloseClick(e: MouseEvent) {
		e.stopPropagation();
		setOpen(false);
	}

	return (
		<>
			<button className="btn mr-2" onClick={() => setOpen(true)} disabled={props.disabled}>
				Origin
				{0 < props.value.length && <span className="badge badge-sm badge-secondary">{props.value.length}</span>}
			</button>
			<Modal open={open} onClose={() => setOpen(false)} position="bottom" backdrop className="overflow-hidden">
				<div className="overflow-auto relative max-h-[75vh]">
					<MultilevelSelect types={props.origins} value={props.value} onChange={props.onChange} />

					<div className="flex bg-white sticky bottom-0 z-20 pt-3">
						<button className="btn mr-2" onClick={onResetClick}>
							Clear
						</button>
						<button className="btn btn-primary flex-1" onClick={onCloseClick}>
							Confirm
						</button>
					</div>
				</div>
			</Modal>
		</>
	);
}
