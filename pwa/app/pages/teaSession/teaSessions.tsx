import { Link, useSearchParams } from "react-router";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, TeaSession } from "~t/types";
import { formatDate, formatISO, isToday, isYesterday } from "date-fns";
import { denormalizeTeaSession, type TeaSessionRaw } from "~/utils/api/normalization/teaSession";
import { AuthLayout } from "~/layouts/AuthLayout";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useInfiniteQuery } from "@tanstack/react-query";
import { handleUIEvent } from "~/utils/function";
import { useUser } from "~/auth/hooks/useUser";
import { useState } from "react";
import { SessionsUserFilter } from "~/pages/teaSession/_components/sessionsUserFilter";
import { SessionShortCard } from "~/pages/teaSession/_components/SessionShortCard";
import { SessionRichCard } from "~/pages/teaSession/_components/SessionRichCard";
import type { Route } from "../../../.react-router/types/app/pages/teaSession/+types/teaSessions";

const TEA_FAMILY_COLOR_CLS = {
	yellow: "text-lime-200",
	white: "text-cyan-200",
	green: "text-green-300",
	wulong: "text-indigo-300",
	black: "text-orange-300",
	fermented: "text-stone-500",
} as const;

export default function ListTeaSessions(props: Route.ComponentProps) {
	const user = useUser();
	const [params] = useSearchParams();
	const [filters, setFilters] = useState<{ username?: string }>({ username: params.get("username") ?? undefined });

	const sessionsQuery = useInfiniteQuery({
		queryFn: async (context) => {
			const filters = typeof context.queryKey[1] === "string" ? {} : context.queryKey[1];
			const response = await getApi<ApiPaginatedCollection<TeaSessionRaw>>(
				`/tea_sessions?${context.pageParam}`,
				context.pageParam ? undefined : filters,
			);
			const data = await response.json();
			return { ...data, member: data.member.map(denormalizeTeaSession) };
		},
		queryKey: ["sessions", filters],
		getPreviousPageParam: () => undefined,
		getNextPageParam: (lastPage) => lastPage.view.next?.split("?")[1],
		initialPageParam: "",
	});

	function filterUser(username: string | undefined) {
		setFilters((f) => ({ ...f, username: username }));
	}

	const items =
		sessionsQuery.data?.pages?.reduce((carr, p) => {
			carr.push(...p.member);
			return carr;
		}, [] as TeaSession[]) ?? [];

	const sessionsByDay = items.reduce(
		(days, session) => {
			const date = formatISO(session.drankAt, { representation: "date" });
			days[date] = [...(days[date] ?? []), session];
			return days;
		},
		{} as { [key: string]: TeaSession[] },
	);

	return (
		<AuthLayout className="p-4 pb-18" activeKey="activity">
			<SessionsUserFilter username={filters.username} onChange={filterUser} className="mb-8" />

			{0 !== items.length && (
				<>
					<ul className="mt-4">
						{Object.values(sessionsByDay).map((sessions) => {
							const date = sessions[0].drankAt;

							return (
								<li key={formatISO(date, { representation: "date" })} className="mb-12">
									<div className="leading-tight mb-4 text-lg">
										{isToday(date) ? (
											<span>Today</span>
										) : isYesterday(date) ? (
											<span>Yesterday</span>
										) : (
											<>
												<span className="text-xs uppercase text-base-content/60">
													{formatDate(date, "yyyy")}
												</span>
												<br />
												<span>{formatDate(date, "d MMMM")}</span>
											</>
										)}
									</div>

									<ul>
										{sessions.map((session) => {
											const author = session.author;

											if (!author || typeof author === "string") {
												return null;
											}

											if (!session.note?.trim()?.length) {
												return (
													<li key={session.id} className="mb-4">
														<Link to={`/sessions/${session.id}`}>
															<SessionShortCard
																family={session.tea.family}
																type={session.tea.type}
																path={session.tea.originPath}
																author={author}
																cultivar={session.tea.cultivar}
																onAuthorClick={() => filterUser(author.username)}
															/>
														</Link>
													</li>
												);
											}

											return (
												<li key={session.id} className="mb-4">
													<Link to={`/sessions/${session.id}`}>
														<SessionRichCard
															teaId={session.tea.id}
															family={session.tea.family}
															type={session.tea.type}
															path={session.tea.originPath}
															note={session.note}
															author={author}
															cultivar={session.tea.cultivar}
															onAuthorClick={() => filterUser(author.username)}
														/>
													</Link>
												</li>
											);
										})}
									</ul>
								</li>
							);
						})}
					</ul>

					{sessionsQuery.hasNextPage && (
						<button
							className="btn btn-block btn-outline"
							onClick={handleUIEvent(() => sessionsQuery.fetchNextPage())}
							disabled={sessionsQuery.isFetchingNextPage}
						>
							Load previous
						</button>
					)}
				</>
			)}

			<Link
				to="/session/new"
				className="absolute right-3 bottom-3 btn btn-primary rounded-full h-12 w-12 shadow-md"
			>
				<PlusIcon className="size-4" />
			</Link>
		</AuthLayout>
	);
}
