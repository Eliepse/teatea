import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
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
import { DayPicker, type DayPickerProps } from "react-day-picker";
import Arrow from "~/components/icons/arrow";
import { handleUIEvent } from "~/utils/function";

export function SelectDateFrame(props: DayPickerProps) {
	const navStack = useStackNavigator();

	return (
		<PageLayout
			title="Select a date"
			onBack={navStack.back}
			action={
				<button
					className="btn btn-primary flex mx-auto"
					onClick={handleUIEvent(() => navStack.next({ key: "form" }))}
					disabled={props.mode && !props.selected}
				>
					Confirm <Arrow direction="right" />
				</button>
			}
			withoutPadding
		>
			<DayPicker className="react-day-picker full" {...props} />
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
