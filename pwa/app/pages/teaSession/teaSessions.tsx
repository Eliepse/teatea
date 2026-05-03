import { Link, useSearchParams } from "react-router";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, Embed, Member, TeaSession } from "~t/types";
import { formatDate, formatISO, isToday, isYesterday } from "date-fns";
import { denormalizeTeaSession, type TeaSessionRaw } from "~/utils/api/normalization/teaSession";
import { WithMainMenu } from "~/layouts/WithMainMenu";
import { useInfiniteQuery } from "@tanstack/react-query";
import { f, handleUIEvent } from "~/utils/function";
import { useState } from "react";
import { SessionsUserFilter } from "~/pages/teaSession/_components/sessionsUserFilter";
import { Family } from "~/components/tea/Family";
import { FormatOrigin } from "~/components/shared/FormatOriginPath";
import { CoffeeCup, Shop } from "iconoir-react";
import { FloatingActions } from "~/layouts/FloatingActions";

type Session = Embed<TeaSession, "author", Member>;
type SessionDay = { [key: Member["username"]]: Session[] };

export async function clientLoader() {}

export default function ListTeaSessions() {
	const [params] = useSearchParams();
	const [filters, setFilters] = useState<{ username?: string }>({ username: params.get("username") ?? undefined });

	const sessionsQuery = useInfiniteQuery({
		queryFn: async (context) => {
			const filters = typeof context.queryKey[1] === "string" ? {} : context.queryKey[1];
			const response = await getApi<ApiPaginatedCollection<Embed<TeaSessionRaw, "author", Member>>>(
				`/tea_sessions?${context.pageParam}`,
				context.pageParam ? undefined : filters,
			);
			const data = await response.json();
			return { ...data, member: data.member.map(denormalizeTeaSession) as Session[] };
		},
		queryKey: ["sessions", filters],
		getPreviousPageParam: () => undefined,
		getNextPageParam: (lastPage) => lastPage.view?.next?.split("?")[1],
		initialPageParam: "",
	});

	function filterUser(username: string | undefined) {
		setFilters((f) => ({ ...f, username: username }));
	}

	const items =
		sessionsQuery.data?.pages?.reduce((carr, p) => {
			carr.push(...p.member);
			return carr;
		}, [] as Session[]) ?? [];

	const sessionsByDay = items.reduce(
		(days, session) => {
			const date = formatISO(session.drankAt, { representation: "date" });
			const username = session.author.username;
			const day = days[date] ?? {};
			days[date] = { ...day, [username]: [...(day[username] ?? []), session] };
			return days;
		},
		{} as { [key: string]: SessionDay },
	);

	return (
		<WithMainMenu className="px-4 pb-18 bg-green-50" activeKey="activity">
			<SessionsUserFilter username={filters.username} onChange={filterUser} className="my-8" />

			{0 !== items.length && (
				<>
					<div className="mt-4">
						{Object.values(sessionsByDay).map((sessionsByMember) => {
							const date = Object.values(sessionsByMember)[0][0].drankAt;

							return (
								<div key={formatISO(date, { representation: "date" })} className="mb-16">
									<h2 className="font-header leading-tight -mx-4 py-4 text-xl font-bold text-center sticky top-0 bg-green-50 text-green-900">
										{isToday(date) ? (
											<span>Today</span>
										) : isYesterday(date) ? (
											<span>Yesterday</span>
										) : (
											<span>{formatDate(date, "d MMMM yyyy")}</span>
										)}
									</h2>

									<ul>
										{Object.values(sessionsByMember).map((sessions) => {
											const author = sessions[0].author;

											return (
												<li key={author.username} className="mb-4">
													<MemberSessionsGroup
														member={author}
														sessions={sessions}
														onMemberClick={(u) => filterUser(u)}
													/>
												</li>
											);
										})}
									</ul>
								</div>
							);
						})}
					</div>

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

			<FloatingActions>
				<Link to="/tea/search" className="ml-auto btn btn-primary rounded-full h-12 shadow-md">
					<CoffeeCup className="size-4" /> Start brewing
				</Link>
			</FloatingActions>
		</WithMainMenu>
	);
}

function MemberSessionsGroup(props: {
	member: Member;
	sessions: Session[];
	onMemberClick?: (username: string) => void;
}) {
	return (
		<div className="mb-8">
			<h3
				className="text-green-800/80 mb-2 ml-1 cursor-pointer"
				onClick={() => f(props.onMemberClick)(props.member.username)}
			>
				@{props.member.username}
			</h3>
			<ul className="bg-white rounded-xl shadow">
				{props.sessions.map((session) => (
					<li key={session.id} className="nth-[1]:border-0 border-t border-green-100">
						<Link to={`/sessions/${session.id}`}>
							<SessionListItem tea={session.tea} place={session.place} />
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

export function SessionListItem(props: { tea: Session["tea"]; place?: Session["place"] }) {
	return (
		<article className="px-4 py-3 flex items-center">
			<div className="flex-1">
				<div>
					<Family family={props.tea.family} iconOnly className="mr-1" />
					<span className="capitalize">{props.tea.type?.name ?? `${props.tea.family} tea`}</span>
				</div>
				<div className="text-sm text-teal-600">
					{props.tea.cultivar && <span className="text-teal-600 text-sm">{props.tea.cultivar.name}</span>}
					{props.tea.cultivar && props.tea.origin && <span className="mx-1">&middot;</span>}
					{props.tea.origin && <FormatOrigin origin={props.tea.origin} maxLevel="region" />}
				</div>
			</div>
			<div className="text-sm">
				{!!props.place && (
					<span className="flex items-center text-teal-800">
						<Shop className="inline size-4 mr-1" /> {props.place.name}
					</span>
				)}
			</div>
		</article>
	);
}
