import { XmarkCircle } from "iconoir-react";
import { useMemo, useState } from "react";
import { handleUIEvent } from "~/utils/function";
import { Modal } from "~/components/shared/modal/Modal";
import { WheelPicker, WheelPickerWrapper } from "@ncdai/react-wheel-picker";

export function YearInput(props: {
	value?: number;
	onChange: (value: number | undefined) => void;
	min: number;
	defaultValue?: number;
	placeholder?: string;
	max?: number;
	allowClear?: boolean;
}) {
	const [modalOpen, setModalOpen] = useState(false);
	const [value, setValue] = useState<number>(props.value ?? new Date().getFullYear());

	const options = useMemo(() => {
		const max = props.max ?? new Date().getFullYear();
		return new Array(max - props.min + 1).fill(0).map((_, i) => {
			const value = props.min + i;
			return { value: value.toFixed(), label: value };
		});
	}, [props.max, props.min]);

	function clearValue() {
		if (true !== props.allowClear) {
			return;
		}

		props.onChange(undefined);
	}

	function confirm() {
		setModalOpen(false);
		props.onChange(value);
	}

	return (
		<>
			<div
				className="input input-lg flex items-stretch pr-0 w-auto"
				onClick={handleUIEvent(() => setModalOpen(true))}
			>
				<input
					type="text"
					className="grow"
					inputMode="numeric"
					value={props.value?.toFixed() ?? ""}
					placeholder={props.placeholder}
					readOnly
				/>
				<button
					className="flex-none px-4 cursor-pointer text-zinc-400 hover:text-zinc-800"
					onClick={handleUIEvent(clearValue)}
				>
					<XmarkCircle className="size-5 flex-none" />
				</button>
			</div>

			<Modal onClose={() => setModalOpen(false)} open={modalOpen} position="bottom">
				<div className="flex mb-4">
					<button className="btn btn-outline" onClick={() => setModalOpen(false)}>
						Back
					</button>
					<button className="btn btn-primary ml-auto" onClick={confirm}>
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
		</>
	);
}
