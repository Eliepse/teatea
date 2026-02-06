import { useQuery } from "@tanstack/react-query";
import { type Iri, type TeaFamily } from "~t/types";
import { extractId } from "~/utils/resource";
import { getApi } from "~/utils/api";
import { eachWeekOfInterval, formatISO, sub } from "date-fns";
import { Bar } from "react-chartjs-2";
import { BarElement, CategoryScale, Chart, LinearScale } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement);

type TInterval = Partial<{ [key in TeaFamily]: number }>;
type TStats = { [key: string]: TInterval };

export function MemberTeaFamiliesChart(props: { memberIri: Iri }) {
	const since = sub(new Date(), { months: 6 });
	const weeks = eachWeekOfInterval({ start: since, end: new Date() }, { weekStartsOn: 1 }).map((d) =>
		formatISO(d, { representation: "date" }),
	);
	const queryParams = { since: formatISO(since, { representation: "date" }), interval: "week" };

	const query = useQuery({
		queryFn: async () => {
			return await (
				await getApi<TStats>(`/api/members/${extractId(props.memberIri)}/tea-families/stats`, queryParams)
			).json();
		},
		queryKey: [props.memberIri, "stats:families", queryParams],
	});

	if (!query.isPending && !query.data) {
		return "Error";
	}

	const data = query.data ?? {};

	return (
		<Bar
			options={{
				responsive: true,
				scales: {
					y: { stacked: true, beginAtZero: true, border: { color: "#e7e5e4" }, grid: { color: "#e7e5e4" } },
					x: { stacked: true, display: false },
				},
				plugins: { legend: { display: false } },
				datasets: { bar: { borderRadius: 6 } },
			}}
			data={{
				labels: weeks,
				datasets: [
					{
						data: weeks.map((week) => data[week]?.white ?? 0),
						backgroundColor: "#a5f3fc", // cyan-200
						order: 6,
					},
					{
						data: weeks.map((week) => data[week]?.yellow ?? 0),
						backgroundColor: "#d9f99d", // lime-200
						order: 5,
					},
					{
						data: weeks.map((week) => data[week]?.green ?? 0),
						backgroundColor: "#86efac", // green-300
						order: 4,
					},
					{
						data: weeks.map((week) => data[week]?.wulong ?? 0),
						backgroundColor: "#a5b4fc", // indigo-300
						order: 3,
					},
					{
						data: weeks.map((week) => data[week]?.black ?? 0),
						backgroundColor: "#fb923c", // orange-400
						order: 2,
					},
					{
						data: weeks.map((week) => data[week]?.fermented ?? 0),
						backgroundColor: "#78716c", // stone-500
						order: 1	,
					},
				],
			}}
		/>
	);
}
