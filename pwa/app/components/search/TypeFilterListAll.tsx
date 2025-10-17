import { Modal } from "~/components/shared/modal/Modal";
import { type MouseEvent, useState } from "react";
import { MultilevelSelect } from "~/components/search/MultilevelSelect";

type Type = { id: number; path: string; name: string; children?: Type[] };
export type TypeFilterValue = Type[];

export function TypeFilterListAll(props: {
	types: Type[];
	value: Type[];
	onChange: (value: Type[]) => void;
	disabled?: boolean;
}) {
	const [open, setOpen] = useState(false);

	function onCloseClick(e: MouseEvent) {
		e.stopPropagation();
		setOpen(false);
	}

	function onResetClick(e: MouseEvent) {
		e.stopPropagation();
		props.onChange([]);
		setOpen(false);
	}

	return (
		<>
			<button className="btn mr-2" onClick={() => setOpen(true)} disabled={props.disabled}>
				Type
				{0 < props.value.length && <span className="badge badge-sm badge-secondary">{props.value.length}</span>}
			</button>

			<Modal open={open} onClose={() => setOpen(false)} position="bottom" className="overflow-hidden">
				<div className="overflow-auto relative max-h-[75vh]">
					<MultilevelSelect types={props.types} value={props.value} onChange={props.onChange} />

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
