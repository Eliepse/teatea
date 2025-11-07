import {
	eachDayOfInterval,
	eachWeekOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	getDate,
	interval,
	isToday,
	isWithinInterval,
	startOfMonth,
} from "date-fns";
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

function Month(props: { year: number; month: number; className?: string }) {
	const monthInterval = interval(
		startOfMonth(new Date(props.year, props.month)),
		endOfMonth(new Date(props.year, props.month)),
	);

	return (
		<div className={clsx(props.className)}>
			<h2 className="sticky top-0 px-4 py-2 bg-white uppercase text-sm text-base-content/50 font-bold">
				{format(monthInterval.start, "MMMM yyyy")}
			</h2>
			<div className="p-4">
				<table className="w-full">
					<tbody>
						{eachWeekOfInterval(monthInterval, { weekStartsOn: 1 }).map((startOfWeek) => (
							<tr>
								{eachDayOfInterval(interval(startOfWeek, endOfWeek(startOfWeek))).map((day) => (
									<td>
										{isWithinInterval(day, monthInterval) ? (
											<Day key={day.toDateString()} day={day} />
										) : null}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function Day(props: { day: Date }) {
	return (
		<button className={clsx("w-full py-3 hover:bg-base-200", isToday(props.day) && "border border-accent")}>
			{getDate(props.day)}
		</button>
	);
}
