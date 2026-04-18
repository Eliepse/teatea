import { XmarkCircle } from "iconoir-react";
import { useMemo, useState } from "react";
import { handleUIEvent } from "~/utils/function";
import { SelectYearModal } from "~/components/shared/modal/SelectYearModal";

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

			<SelectYearModal
				open={modalOpen}
				min={props.min}
				max={props.max}
				value={props.value}
				onConfirm={(value) => {
					setModalOpen(false);
					props.onChange(value);
				}}
				onClose={() => setModalOpen(false)}
			/>
		</>
	);
}
