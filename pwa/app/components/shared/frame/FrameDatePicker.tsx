import clsx from "clsx";
import { DayPicker } from "react-day-picker";
import { type ReactNode, useState } from "react";
import { FrameActions } from "~/components/teaSession/CreateTeaSessionFlow";

export function FrameDatePicker(props: {
	onConfirm: (date: Date) => void;
	defaultValue?: Date;
	onBack?: () => void;
	buttonText?: string;
	header?: ReactNode;
	className?: string;
}) {
	const [selectedDay, setSelectedDay] = useState(props.defaultValue);

	function confirm() {
		if (!selectedDay) {
			return;
		}

		props.onConfirm(selectedDay);
	}

	return (
		<div className={clsx("flex flex-col", props.className)}>
			{props.header}

			<DayPicker
				className="react-day-picker bg-transparent full flex-1"
				mode="single"
				selected={selectedDay}
				onSelect={setSelectedDay}
				disabled={{ after: new Date() }}
				endMonth={new Date()}
				showOutsideDays
				required
			/>

			<FrameActions onBack={props.onBack} onNext={confirm} className="p-4 flex-none" disableNext={!selectedDay} />
		</div>
	);
}
