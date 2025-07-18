import { useQuery } from "@tanstack/react-query";
import { addDays, eachWeekOfInterval, endOfYear, getDayOfYear, getYear, parse, setYear, startOfYear } from "date-fns";
import { fetchApi } from "~/utils/api";
import { useMemo } from "react";
import clsx from "clsx";
import { keyBy } from "~/utils/array";

type ActivityGraphDay = {
	"@type": string;
	date: Date;
	total: number;
	level: keyof typeof levelClass;
};

type ActivityGraph = {
	id: number;
	"@id": string;
	"@type": string;
	year: number;
	items: ActivityGraphDay[];
};

const levelClass = {
	0: "bg-base-200",
	1: "bg-primary/40",
	2: "bg-primary/60",
	3: "bg-primary",
} as const;

export function ActivityGraph(props: { year?: number; className?: string }) {
	const today = new Date();
	const year = props.year ?? getYear(today);
	const date = setYear(today, year);
	const weeks = eachWeekOfInterval({ start: startOfYear(date), end: endOfYear(date) }, { weekStartsOn: 1 });
	const weekDays = [0, 1, 2, 3, 4, 5, 6];

	const { data } = useQuery({
		queryKey: ["activityGraph", year],
		queryFn: async () => {
			const response = await fetchApi(`/activity_graphs/${year}`);
			const data = await response.json();

			return {
				...data,
				items: data.items.map((item: ActivityGraphDay & { date: string }) => ({
					...item,
					date: parse(item.date, "yyyy-MM-dd", new Date()),
				})),
			} as ActivityGraph;
		},
	});

	const dataByDay = useMemo(
		() => (data?.items ? keyBy(data.items, (item) => getDayOfYear(item.date)) : {}),
		[data?.items],
	);

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
											isInYear && levelClass[data?.level ?? 0],
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
