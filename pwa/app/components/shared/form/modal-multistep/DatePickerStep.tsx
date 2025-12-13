import { useState } from "react";
import { NextButton } from "~/components/shared/form/modal-multistep/NextButton";
import { DayPicker } from "react-day-picker";
import { isSameDay } from "date-fns";

export function DatePickerStep(props: {
	defaultValue?: Date;
	allowEmpty?: boolean;
	onNext: (date?: Date) => Promise<void> | void;
}) {
	const [pending, setPending] = useState(false);
	const [value, setValue] = useState(props.defaultValue);

	async function handleConfirm() {
		setPending(true);
		await props.onNext(value);
		setPending(false);
	}

	function selectDay(date: Date) {
		if (!props.allowEmpty) {
			setValue(date);
			return;
		}

		setValue((st) => (st && isSameDay(st, date) ? undefined : date));
	}

	return (
		<>
			<DayPicker
				className="react-day-picker full min-h-96"
				mode="single"
				selected={value}
				onSelect={selectDay}
				disabled={{ after: new Date() }}
				endMonth={new Date()}
				showOutsideDays
				required
			/>

			<div className="p-4 sticky bottom-0 bg-white">
				<NextButton
					onClick={handleConfirm}
					disabled={!props.allowEmpty && !value}
					loading={pending}
					label={props.allowEmpty && !value ? "I don't know" : "Next"}
				/>
			</div>
		</>
	);
}
