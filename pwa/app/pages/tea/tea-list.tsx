import { AuthLayout } from "~/layouts/AuthLayout";
import { handleUIEvent } from "~/utils/function";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection } from "~t/types";
import { denormalizeTea, type TeaRaw } from "~/utils/api/normalization/tea";
import { useUser } from "~/auth/hooks/useUser";
import { TeaShortCard } from "~/components/tea/TeaShortCard";

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
		<AuthLayout className="pb-8">
			<header className="p-4 mb-4">
				<button className="btn btn-ghost p-0 mb-4" onClick={handleUIEvent(() => navigate(-1))}>
					<ArrowLeftIcon className="size-4 mr-1" /> Back
				</button>

				<h1 className="text-xl">Teas you already tasted</h1>
			</header>

			{!teasQuery.isPending && !hasTeas && (
				<p className="px-8 mt-8 text-center text-base-content/80">
					You haven't tasted any tea yet. Ready to{" "}
					<Link className="link link-primary" to="/session/new">
						record your first session?
					</Link>
				</p>
			)}

			{teasQuery.isPending && (
				<div className="px-4">
					<div className="h-16 skeleton mb-2" />
					<div className="h-16 skeleton mb-2" />
					<div className="h-16 skeleton mb-2" />
					<div className="h-16 skeleton mb-2" />
					<div className="h-16 skeleton mb-2" />
					<div className="h-16 skeleton mb-2" />
				</div>
			)}

			{hasTeas && (
				<div className="px-4">
					<ul className="mb-4">
						{teasQuery.data?.pages.map((page) =>
							page.member.map((tea) => (
								<li key={tea.id} className="mb-2">
									<Link to={`/tea/${tea.id}`}>
										<TeaShortCard
											family={tea.family}
											type={tea.type}
											path={tea.originPath}
											cultivar={tea.cultivar}
											className="bg-slate-100"
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
