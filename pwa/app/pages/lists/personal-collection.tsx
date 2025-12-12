import type { Route } from "../../../.react-router/types/app/pages/lists/+types/personal-collection";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection } from "~t/types";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { AuthLayout } from "~/layouts/AuthLayout";
import { TokenUtils } from "~/auth/hooks/useToken";
import { TeaCard } from "~/components/tea/TeaCard";
import { type CollectionTeaRaw, denormalizeCollectionTea } from "~/utils/api/normalization/collectionTea";
import { limit } from "~/utils/text";

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
						>
							{!!teaLink.description && (
								<p className="px-4 py-2 mb-2 border-b border-dashed border-green-200 text-stone-600">
									{limit(teaLink.description, 128)}
								</p>
							)}
							<ul className="py-2 px-4 text-stone-500">
								{!!teaLink.acquiredAt && (
									<li className="flex justify-between gap-4">
										<span>Acquired</span>
										{teaLink.acquiredAt.toLocaleDateString()}
									</li>
								)}
							</ul>
						</TeaCard>
					</li>
				))}
			</ul>
		</AuthLayout>
	);
}
