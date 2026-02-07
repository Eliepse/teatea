import { type Iri, teaFamilies, type TeaFamily } from "~t/types";
import { formatISO, sub } from "date-fns";
import { getApi } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";
import { extractId } from "~/utils/resource";
import { Doughnut } from "react-chartjs-2";
import { ArcElement, CategoryScale, Chart } from "chart.js";

Chart.register(CategoryScale, ArcElement);

type TData = Partial<{ [key in TeaFamily]: number }>;

export function MemberFamiliesChart(props: { memberIri: Iri; className?: string }) {
	const since = sub(new Date(), { months: 1 });
	const queryParams = { since: formatISO(since, { representation: "date" }) };

	const query = useQuery({
		queryFn: async () => {
			return await (
				await getApi<TData>(`/api/members/${extractId(props.memberIri)}/stats/families`, queryParams)
			).json();
		},
		queryKey: [props.memberIri, "stats:families", queryParams],
	});

	if (!query.isPending && !query.data) {
		return "Error";
	}

	const data = query.data ?? {};
	const dataset = Object.keys(teaFamilies).map((family) => data[family as TeaFamily] ?? 0);

	return (
		<Doughnut
			className={props.className}
			options={{
				circumference: 180,
				rotation: 270,
				aspectRatio: 2,
				elements: { arc: { borderWidth: 2, borderRadius: 6 } },
				events: [],
			}}
			data={{
				labels: Object.keys(teaFamilies),
				datasets: [
					{
						data: dataset,
						backgroundColor: [
							"#a5f3fc", // white: cyan-200
							"#d9f99d", // yellow: lime-200
							"#86efac", // green: green-300
							"#a5b4fc", // wulong: indigo-300
							"#fb923c", // black: orange-400
							"#78716c", // fermented: stone-500
						],
					},
				],
			}}
		/>
	);
}
