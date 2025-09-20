import { Link } from "react-router";
import { fetchApi, getApi } from "~/utils/api";
import type { ApiCollection, ApiPaginatedCollection, OriginPath, TeaFamily, TeaSession, TeaType } from "~t/types";
import { formatDate, formatDistanceToNow, formatISO, isToday, subDays } from "date-fns";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import { denormalizeTeaSession, type TeaSessionRaw } from "~/utils/api/normalization/teaSession";
import { limit } from "~/utils/text";
import { AuthLayout } from "~/layouts/AuthLayout";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useInfiniteQuery } from "@tanstack/react-query";
import { f, handleUIEvent } from "~/utils/function";
import clsx from "clsx";
import { useUser } from "~/auth/hooks/useUser";
import { useState } from "react";
import Leaf from "~/components/icons/leaf";
import { SessionsUserFilter } from "~/pages/teaSession/_components/sessionsUserFilter";

const PAGE_SIZE = 14;

async function fetchSessions(username?: string) {
	const response = await fetchApi<ApiCollection<TeaSessionRaw>>(`/tea_sessions`);
	const data = await response.json();
	return { ...data, member: data.member.map(denormalizeTeaSession) };
}

function getNextCursorFromSession(session?: TeaSession) {
	return session ? formatISO(subDays(session.drankAt, 1), { representation: "date" }) : null;
}

const TEA_FAMILY_BORDER_CLS = {
	yellow: "border-lime-200",
	white: "border-cyan-200",
	green: "border-green-300",
	wulong: "border-indigo-300",
	black: "border-orange-300",
	fermented: "border-stone-500",
} as const;

const TEA_FAMILY_COLOR_CLS = {
	yellow: "text-lime-200",
	white: "text-cyan-200",
	green: "text-green-300",
	wulong: "text-indigo-300",
	black: "text-orange-300",
	fermented: "text-stone-500",
} as const;

export default function ListTeaSessions() {
	const user = useUser();
	const [filters, setFilters] = useState<{ username?: string }>({});

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
			<SessionsUserFilter
				username={filters.username}
				onChange={(u) => setFilters((f) => ({ ...f, username: u }))}
				className="mb-8"
			/>

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
											const username =
												typeof session.author !== "string"
													? session.author?.username
													: undefined;
											return (
												<li key={session.id} className="mb-4">
													<Link to={`/sessions/${session.id}`}>
														<Item
															family={session.tea.family}
															type={session.tea.type}
															path={session.tea.originPath}
															note={session.note}
															grams={session.teaQuantity}
															ml={session.waterMl}
															username={username}
															drankAt={
																isToday(session.drankAt) ? session.drankAt : undefined
															}
															onAuthorClick={() =>
																setFilters((f) => ({ ...f, username }))
															}
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

function Item(props: {
	family: TeaFamily;
	type?: TeaType;
	path?: OriginPath;
	note?: string;
	grams?: number;
	ml?: number;
	username?: string;
	drankAt?: Date;
	onAuthorClick?: () => void;
}) {
	return (
		<article className="bg-base-200 rounded h-min-16 pb-1">
			<div className="py-2 px-3 mb-3 flex justify-between text-xs text-base-content/60 leading-tight border-b border-gray-200">
				{!!props.drankAt && <span>{formatDistanceToNow(props.drankAt)} ago</span>}
				{!!props.username && (
					<span className="ml-auto" onClick={handleUIEvent(f(props.onAuthorClick))}>
						@{props.username}
					</span>
				)}
			</div>

			<div className="px-3 flex justify-between text-xs text-base-content/60 leading-tight">
				<span className="uppercase text-base-content/40">
					<Leaf className={clsx("size-3 inline-block mr-1 mb-0.5", TEA_FAMILY_COLOR_CLS[props.family])} />
					{props.family}
				</span>
				{props.path && <FormatOriginPath originPath={props.path} />}
			</div>

			<div className="px-3 pb-2 flex">
				<span className="capitalize">{props.type?.name ?? `${props.family} tea`}</span>
				<span className="ml-auto">
					{[props.grams ? `${props.grams} g` : null, props.ml ? `${props.ml} ml` : null]
						.filter((v) => v)
						.join(" · ")}
				</span>
			</div>
			{!!props.note && (
				<div className="border-t border-base-300 pt-2 pb-2 px-3 text-base-content/60 text-sm">
					{limit(props.note, 126)}
				</div>
			)}
		</article>
	);
}
