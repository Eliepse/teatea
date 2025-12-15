import type { Route } from "../../../.react-router/types/app/pages/member/+types/personal-collection";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection } from "~t/types";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { AuthLayout } from "~/layouts/AuthLayout";
import { TokenUtils } from "~/auth/hooks/useToken";
import { type CollectionTeaRaw, denormalizeCollectionTea } from "~/utils/api/normalization/collectionTea";
import { CollectionTeaCard } from "~/pages/member/_components/CollectionTeaCard";

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
			const response = await getApi<ApiPaginatedCollection<CollectionTeaRaw>>(`/members/${ctx.queryKey[1]}/teas`);
			const data = await response.json();
			return { ...data, member: data.member.map(denormalizeCollectionTea) };
		},
		queryKey: ["collectionTeas", props.params.username],
	});

	return (
		<AuthLayout activeKey="my-teas" className="p-4 pb-20 bg-green-50 min-h-dvh">
			<header className="mb-8 pt-2 relative">
				<BackButton className="mr-auto shadow-sm absolute top-0 left-0" />
				<h1 className="text-3xl font-bold font-header text-center text-green-900">Personal collection</h1>
			</header>
			<ul>
				{itemsQuery.data?.member?.map((item) => (
					<li key={item.id} className="mb-2">
						<CollectionTeaCard
							tea={item.tea}
							acquiredFrom={item.acquiredFrom}
							acquiredAt={item.acquiredAt}
							description={item.description}
						/>
					</li>
				))}
			</ul>
		</AuthLayout>
	);
}
