import { Fragment, useMemo, useState } from "react";
import { Calendar } from "iconoir-react";
import { TeaSpecButton } from "~/catalog/components/CreateTeaModal/TeaSpecButton";
import { Modal } from "~/components/shared/modal/Modal";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";
import { WheelPicker, WheelPickerWrapper } from "@ncdai/react-wheel-picker";

export function HarvestYearAction(props: { year?: number; onChange: (year?: number) => void }) {
	const [isSelecting, setIsSelecting] = useState(false);
	const [value, setValue] = useState<number | undefined>(props.year);
	const options = useMemo(() => {
		const max = new Date().getFullYear();
		return new Array(max - 1850 + 1).fill(0).map((_, i) => {
			const value = 1850 + i;
			return { value: value.toFixed(), label: value };
		});
	}, []);

	function cancel() {
		setValue(props.year);
		setIsSelecting(false);
	}

	function confirm() {
		props.onChange(value);
		setIsSelecting(false);
	}

	function clear() {
		props.onChange(undefined);
		setIsSelecting(false);
	}

	return (
		<Fragment>
			<TeaSpecButton
				icon={<Calendar className="size-4" />}
				label={props.year ?? "Harvest year"}
				onClick={() => setIsSelecting(true)}
				filled={!!props.year}
			/>

			<Modal open={isSelecting} onClose={() => setIsSelecting(false)} className="pb-6">
				<div className="flex gap-4 p-4 border-b border-green-200">
					<SecondaryButton className="flex-1" onClick={cancel}>
						Cancel
					</SecondaryButton>
					<PrimaryButton className="flex-2" onClick={confirm}>
						Confirm
					</PrimaryButton>
				</div>

				<WheelPickerWrapper>
					<WheelPicker
						options={options}
						value={(value ?? new Date().getFullYear()).toFixed()}
						onValueChange={(v) => setValue(parseInt(v))}
						optionItemHeight={40}
						classNames={{
							optionItem: "text-zinc-400",
							highlightWrapper: "bg-zinc-100 text-zinc-950",
							highlightItem: "",
						}}
					/>
				</WheelPickerWrapper>

				<div className="mt-4 mx-4">
					<SecondaryButton onClick={clear} className="w-full">
						Clear
					</SecondaryButton>
				</div>
			</Modal>
		</Fragment>
	);
}
