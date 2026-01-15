import clsx from "clsx";
import { useMemo } from "react";
import { keyBy } from "~/utils/array";
import { addDays, eachWeekOfInterval, endOfYear, getDayOfYear, getYear, setYear, startOfYear } from "date-fns";

type ActivityGraphDay = {
	"@type": string;
	date: Date;
	total: number;
	level: Level;
};

type ActivityGraph = {
	id: number;
	"@id": string;
	"@type": string;
	year: number;
	items: ActivityGraphDay[];
};

type Level = keyof typeof levelClass;

const levelClass = {
	0: "bg-base-200",
	1: "bg-primary/40",
	2: "bg-primary/60",
	3: "bg-primary",
} as const;

export function MemberActivityGraph(props: { year?: number; items: any[]; level: Level; className?: string }) {
	const today = new Date();
	const year = props.year ?? getYear(today);
	const date = setYear(today, year);
	const weeks = eachWeekOfInterval({ start: startOfYear(date), end: endOfYear(date) }, { weekStartsOn: 1 });
	const weekDays = [0, 1, 2, 3, 4, 5, 6];

	const dataByDay = useMemo(
		() => (props.items ? keyBy(props.items, (item) => getDayOfYear(item.date)) : {}),
		[props.items],
	);

	console.debug(dataByDay)

	return (
		<table className={clsx("w-full border-collapse", props.className)}>
			<tbody>
				{weekDays.map((weekDay) => (
					<tr key={weekDay}>
						{weeks.map((week) => {
							const day = addDays(week, weekDay);
							const isInYear = getYear(day) === year;
							const data = isInYear ? dataByDay[getDayOfYear(day)] : null;

							return (
								<td key={day.getTime()} className="border border-transparent">
									<div
										className={clsx(
											"aspect-square",
											false === isInYear && "opacity-0",
											isInYear && levelClass[props.level ?? 0],
										)}
									/>
								</td>
							);
						})}
					</tr>
				))}
			</tbody>
		</table>
	);
}
