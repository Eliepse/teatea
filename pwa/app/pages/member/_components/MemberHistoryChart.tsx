import { useQuery } from "@tanstack/react-query";
import { type Iri, type TeaFamily } from "~t/types";
import { extractId } from "~/utils/resource";
import { getApi } from "~/utils/api";
import {
	eachDayOfInterval,
	eachMonthOfInterval,
	eachWeekOfInterval,
	formatISO,
	intervalToDuration,
	sub,
} from "date-fns";
import { Bar } from "react-chartjs-2";
import { BarElement, CategoryScale, Chart, LinearScale } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement);

type TInterval = Partial<{ [key in TeaFamily]: number }>;
type TStats = { [key: string]: TInterval };

type QInterval = "day" | "week" | "month";

function decideInterval(since: Date): QInterval {
	const duration = intervalToDuration({ start: since, end: new Date() });

	if (undefined === duration) {
		return "week";
	}

	const years = duration.years ?? 0;
	const months = duration.months ?? 0;

	if (0 === years && 2 > months) {
		return "day";
	}

	if (0 === years && 8 > months) {
		return "week";
	}

	return "month";
}

function getLabels(since: Date, interval: QInterval): string[] {
	if ("month" === interval) {
		return eachMonthOfInterval({ start: since, end: new Date() }).map((d) =>
			formatISO(d, { representation: "date" }),
		);
	}
	if ("week" === interval) {
		return eachWeekOfInterval({ start: since, end: new Date() }, { weekStartsOn: 1 }).map((d) =>
			formatISO(d, { representation: "date" }),
		);
	}

	return eachDayOfInterval({ start: since, end: new Date() }).map((d) => formatISO(d, { representation: "date" }));
}

export function MemberHistoryChart(props: { memberIri: Iri; className?: string; since?: Date }) {
	const sinceDate = props.since ?? sub(new Date(), { months: 6 });
	const queryParams = {
		since: formatISO(sinceDate, { representation: "date" }),
		interval: decideInterval(sinceDate),
	};
	const labels = getLabels(sinceDate, queryParams.interval);

	const query = useQuery({
		queryFn: async () => {
			return await (
				await getApi<TStats>(`/api/members/${extractId(props.memberIri)}/stats/history`, queryParams)
			).json();
		},
		queryKey: [props.memberIri, "stats:history", queryParams],
		staleTime: 120_000,
	});

	if (!query.isPending && !query.data) {
		return "Error";
	}

	const data = query.data ?? {};

	return (
		<Bar
			className={props.className}
			options={{
				responsive: true,
				scales: {
					y: { stacked: true, beginAtZero: true, border: { color: "#e7e5e4" }, grid: { color: "#e7e5e4" } },
					x: { stacked: true, display: false },
				},
				plugins: { legend: { display: false } },
				datasets: { bar: { borderRadius: 6, barPercentage: 1 } },
			}}
			data={{
				labels: labels,
				datasets: [
					{
						data: labels.map((week) => data[week]?.white ?? 0),
						backgroundColor: "#a5f3fc", // cyan-200
						order: 6,
					},
					{
						data: labels.map((week) => data[week]?.yellow ?? 0),
						backgroundColor: "#d9f99d", // lime-200
						order: 5,
					},
					{
						data: labels.map((week) => data[week]?.green ?? 0),
						backgroundColor: "#86efac", // green-300
						order: 4,
					},
					{
						data: labels.map((week) => data[week]?.wulong ?? 0),
						backgroundColor: "#a5b4fc", // indigo-300
						order: 3,
					},
					{
						data: labels.map((week) => data[week]?.black ?? 0),
						backgroundColor: "#fb923c", // orange-400
						order: 2,
					},
					{
						data: labels.map((week) => data[week]?.fermented ?? 0),
						backgroundColor: "#78716c", // stone-500
						order: 1,
					},
				],
			}}
		/>
	);
}
