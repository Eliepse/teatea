import { WheelPicker, WheelPickerWrapper } from "@ncdai/react-wheel-picker";
import { Modal } from "~/components/shared/modal/Modal";
import { useMemo, useState } from "react";
import { handleUIEvent } from "~/utils/function";
import Arrow from "~/components/icons/arrow";

export function SelectYearModal(props: {
	open: boolean;
	value?: number;
	min: number;
	max?: number;
	onConfirm: (year?: number) => void;
	onClose: () => void;
}) {
	const [value, setValue] = useState<number>(props.value ?? new Date().getFullYear());
	const options = useMemo(() => {
		const max = props.max ?? new Date().getFullYear();
		return new Array(max - props.min + 1).fill(0).map((_, i) => {
			const value = props.min + i;
			return { value: value.toFixed(), label: value };
		});
	}, [props.max, props.min]);

	return (
		<Modal onClose={props.onClose} open={props.open} className="p-4">
			<div className="flex mb-6">
				<button className="btn btn-lg bg-green-100 rounded-xl" onClick={handleUIEvent(props.onClose)}>
					<Arrow direction="left" className="size-4 mr-1" />
					Back
				</button>

				<button
					className="ml-auto btn btn-lg bg-green-700 text-white rounded-xl disabled:bg-teal-100 disabled:text-teal-500"
					onClick={handleUIEvent(() => props.onConfirm(value))}
				>
					Confirm
				</button>
			</div>

			<WheelPickerWrapper className="rounded-md border border-zinc-200 bg-white">
				<WheelPicker
					options={options}
					value={value.toFixed()}
					onValueChange={(v) => setValue(parseInt(v))}
					classNames={{
						optionItem: "text-zinc-400",
						highlightWrapper: "bg-zinc-100 text-zinc-950",
						highlightItem: "",
					}}
				/>
			</WheelPickerWrapper>
		</Modal>
	);
}
