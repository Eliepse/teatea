import { PageLayout } from "~/components/shared/paged/PageLayout";
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
import Arrow from "~/components/icons/arrow";
import { handleUIEvent } from "~/utils/function";
import { useState } from "react";

export function FrameDatePicker(props: {
	onConfirm: (date: Date) => void;
	defaultValue?: Date;
	onBack?: () => void;
	buttonText?: string;
}) {
	const [selectedDay, setSelectedDay] = useState(props.defaultValue);

	function confirm() {
		if (!selectedDay) {
			return;
		}

		props.onConfirm(selectedDay);
	}

	return (
		<PageLayout
			title="Select a date"
			onBack={props.onBack}
			action={
				<button
					className="btn btn-primary flex ml-auto"
					onClick={handleUIEvent(confirm)}
					disabled={!selectedDay}
				>
					{props.buttonText ?? "Confirm"} <Arrow direction="right" />
				</button>
			}
			withoutPadding
		>
			<DayPicker
				className="react-day-picker full"
				mode="single"
				selected={selectedDay}
				onSelect={setSelectedDay}
				disabled={{ after: new Date() }}
				endMonth={new Date()}
				showOutsideDays
				required
			/>
		</PageLayout>
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
