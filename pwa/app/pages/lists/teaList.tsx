import type { Route } from "../../../.react-router/types/app/pages/lists/+types/teaList";
import { getApi } from "~/utils/api";
import type { TeaList } from "~t/types";
import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const id = args.params.id;

	const response = await getApi<TeaList>(`/lists/${id}`);
	return await response.json();
}

export default function TeaListPage(props: Route.ComponentProps) {
	const navigate = useNavigate();

	useQuery({
		queryFn: async (ctx) => {
			let id = ctx.queryKey[1];
			const response = await getApi<TeaList>(`/lists/${id}/teas`);
			return await response.json();
		},
		queryKey: ["tea-list", props.params.id],
	});

	return <PageLayout onBack={() => navigate(-1)} title={props.loaderData.name}></PageLayout>;
}
