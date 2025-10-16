import type { Route } from "../../../.react-router/types/app/pages/lists/+types/teaList";
import { getApi } from "~/utils/api";
import type { ApiCollection, MemberTea, TeaList } from "~t/types";
import { PageLayout } from "~/components/shared/paged/PageLayout";
import { Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { TeaShortCard } from "~/components/tea/TeaShortCard";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const id = args.params.id;

	const response = await getApi<TeaList>(`/lists/${id}`);
	return await response.json();
}

export default function TeaListPage(props: Route.ComponentProps) {
	const navigate = useNavigate();

	const teaLinks = useQuery({
		queryFn: async (ctx) => {
			let id = ctx.queryKey[1];
			const response = await getApi<ApiCollection<MemberTea>>(`/lists/${id}/teas`);
			return await response.json();
		},
		queryKey: ["tea-list", props.params.id],
	});

	return <PageLayout onBack={() => navigate(-1)} title={props.loaderData.name}>
		<ul>
			{teaLinks.data?.member?.map((teaLink) => (
				<li key={teaLink.id} className="mb-2">
					<Link to={`/tea/${teaLink.tea.id}`}>
						<TeaShortCard
							family={teaLink.tea.family}
							type={teaLink.tea.type}
							path={teaLink.tea.originPath}
							cultivar={teaLink.tea.cultivar}
							className="bg-slate-100"
						/>
					</Link>
				</li>
			))}
		</ul>
	</PageLayout>;
}
