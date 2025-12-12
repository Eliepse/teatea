import type { Route } from "../../../.react-router/types/app/pages/lists/+types/personal-collection";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, MemberTea } from "~t/types";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { AuthLayout } from "~/layouts/AuthLayout";
import { TokenUtils } from "~/auth/hooks/useToken";
import { TeaCard } from "~/components/tea/TeaCard";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const token = TokenUtils.get();
	const { username } = args.params;

	if (token?.username !== username) {
		throw new Error();
	}

	return null;
}

export default function PersonalCollectionPage(props: Route.ComponentProps) {
	const itemsQuery = useQuery({
		queryFn: async (ctx) => {
			const response = await getApi<ApiPaginatedCollection<MemberTea>>(`/members/${ctx.queryKey[1]}/teas`);
			return await response.json();
		},
		queryKey: ["collectionTeas", props.params.username],
	});

	return (
		<AuthLayout activeKey="my-teas" className="p-4 pb-8 bg-green-50 min-h-dvh">
			<header className="mb-8 pt-2 relative">
				<BackButton className="mr-auto shadow-sm absolute top-0 left-0" />
				<h1 className="text-3xl font-bold font-header text-center text-green-900">Personal collection</h1>
			</header>
			<ul>
				{itemsQuery.data?.member?.map((teaLink) => (
					<li key={teaLink.id} className="mb-2">
						<TeaCard
							family={teaLink.tea.family}
							cultivar={teaLink.tea.cultivar}
							roast={teaLink.tea.roast}
							type={teaLink.tea.type}
							year={teaLink.tea.year}
							className="bg-white"
							hideArrow
						/>
					</li>
				))}
			</ul>
		</AuthLayout>
	);
}
