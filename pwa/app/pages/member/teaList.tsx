import type { Route } from "../../../.react-router/types/app/pages/member/+types/teaList";
import { getApi } from "~/utils/api";
import type { ApiCollection, MemberTea, TeaList } from "~t/types";
import { Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { TeaCard } from "~/components/tea/TeaCard";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const id = args.params.id;

	const response = await getApi<TeaList>(`/lists/${id}`);
	return await response.json();
}

export default function TeaListPage(props: Route.ComponentProps) {
	const navigate = useNavigate();

	const teaLinks = useQuery({
		queryFn: async (ctx) => {
			const id = ctx.queryKey[1];
			const response = await getApi<ApiCollection<MemberTea>>(`/lists/${id}/teas`);
			return await response.json();
		},
		queryKey: ["tea-list", props.params.id],
	});

	return (
		<div className="p-4 pb-8 bg-green-50 min-h-dvh">
			<header className="mb-8 pt-2 relative">
				<BackButton className="mr-auto shadow-sm absolute top-0 left-0" />
				<h1 className="text-3xl font-bold font-header text-center text-green-900">{props.loaderData.name}</h1>
			</header>
			<ul>
				{teaLinks.data?.member?.map((teaLink) => (
					<li key={teaLink.id} className="mb-2">
						<Link to={`/tea/${teaLink.tea.id}`}>
							<TeaCard
								family={teaLink.tea.family}
								roast={teaLink.tea.roast}
								type={teaLink.tea.type}
								year={teaLink.tea.year}
								cultivar={teaLink.tea.cultivar}
								origin={teaLink.tea.originPath}
								className="bg-white shadow-sm"
							/>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
