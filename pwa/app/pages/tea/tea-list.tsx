import { AuthLayout } from "~/layouts/AuthLayout";
import { Link, useNavigate } from "react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection } from "~t/types";
import { denormalizeTea, type TeaRaw } from "~/utils/api/normalization/tea";
import { useUser } from "~/auth/hooks/useUser";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { TeaCard } from "~/components/tea/TeaCard";

export default function TeaListPage() {
	const navigate = useNavigate();
	const user = useUser();

	const teasQuery = useInfiniteQuery({
		queryFn: async (context) => {
			if (undefined === user.data?.username) {
				throw new Error("Couldn't get user's ID");
			}

			const payload = await (
				await getApi<ApiPaginatedCollection<TeaRaw>>(
					`/members/${user.data.username}/tea_lists/_tasted/teas?${context.pageParam}`,
				)
			).json();
			return { ...payload, member: payload.member.map(denormalizeTea) };
		},
		enabled: !!user.data?.username,
		queryKey: ["tea", "tasted", user.data?.username],
		getPreviousPageParam: (lastPage) => lastPage.view.previous?.split("?")[1],
		getNextPageParam: (lastPage) => lastPage.view.next?.split("?")[1],
		initialPageParam: "",
	});

	const hasTeas = !!teasQuery.data && 0 !== teasQuery.data.pages.length;

	return (
		<AuthLayout className="p-4 pb-8 bg-green-50">
			<header className="mb-8 pt-2 relative">
				<BackButton className="mr-auto shadow-sm absolute top-0 left-0" />
				<h1 className="text-3xl font-bold font-header text-center text-green-900">Tasted teas</h1>
			</header>

			{!teasQuery.isPending && !hasTeas && (
				<p className="px-4 mt-8 text-center text-base-content/80">
					You haven't tasted any tea yet. Ready to{" "}
					<Link className="link link-primary" to="/tea/search">
						record your first session?
					</Link>
				</p>
			)}

			{teasQuery.isPending && (
				<div>
					<div className="h-16 skeleton mb-2" />
					<div className="h-16 skeleton mb-2" />
					<div className="h-16 skeleton mb-2" />
					<div className="h-16 skeleton mb-2" />
					<div className="h-16 skeleton mb-2" />
					<div className="h-16 skeleton mb-2" />
				</div>
			)}

			{hasTeas && (
				<div>
					<ul className="grid gap-4 mb-4">
						{teasQuery.data?.pages.map((page) =>
							page.member.map((tea) => (
								<li key={tea.id} className="mb-2">
									<Link to={`/tea/${tea.id}`}>
										<TeaCard
											teaId={tea.id}
											family={tea.family}
											roast={tea.roast}
											type={tea.type}
											year={tea.year}
											cultivar={tea.cultivar}
											origin={tea.originPath}
											className="bg-white shadow-sm"
										/>
									</Link>
								</li>
							)),
						)}
					</ul>
					{teasQuery.hasNextPage && (
						<button
							className="btn h-12 btn-block btn-outline"
							onClick={() => teasQuery.fetchNextPage()}
							disabled={teasQuery.isPending}
						>
							Load more
						</button>
					)}
				</div>
			)}
		</AuthLayout>
	);
}
