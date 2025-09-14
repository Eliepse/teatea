import { Link } from "react-router";
import { fetchApi } from "~/utils/api";
import type { ApiCollection, OriginPath, TeaFamily, TeaSession, TeaType } from "~t/types";
import { formatDate, formatISO, subDays } from "date-fns";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import { denormalizeTeaSession, type TeaSeassionRaw } from "~/utils/api/normalization/teaSession";
import { limit } from "~/utils/text";
import { AuthLayout } from "~/layouts/AuthLayout";
import { ActivityGraph } from "~/components/activity/ActivityGraph";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useInfiniteQuery } from "@tanstack/react-query";
import { handleUIEvent } from "~/utils/function";
import clsx from "clsx";
import { useUser } from "~/auth/hooks/useUser";

const PAGE_SIZE = 14;

async function fetchSessions(username: string, cursor?: string) {
	const queryParams = cursor ? `cursor=${cursor}&limit=${PAGE_SIZE}` : `limit=${PAGE_SIZE}`;
	const response = await fetchApi<ApiCollection<TeaSeassionRaw>>(`/members/${username}/sessions?${queryParams}`);
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

export default function ListTeaSessions() {
	const user = useUser();
	const sessionsQuery = useInfiniteQuery({
		queryFn: async (context) => {
			if (undefined === user.data?.username) {
				throw new Error("Username missing");
			}

			return await fetchSessions(user.data.username, context.pageParam);
		},
		queryKey: [user.data?.username, "sessions"],
		enabled: undefined !== user.data?.username,
		getPreviousPageParam: () => undefined,
		getNextPageParam: (_last, allPages) => {
			const lastPage = allPages.slice(-1)[0];

			// Incomplete page means last page
			if (PAGE_SIZE > (lastPage?.member?.length ?? PAGE_SIZE)) {
				return undefined;
			}

			const lastItem = lastPage.member?.slice(-1)[0];
			return lastItem ? getNextCursorFromSession(lastItem) : undefined;
		},
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

	if (!sessionsQuery.isPending && 0 === sessionsQuery.data?.pages[0]?.member?.length) {
		return (
			<AuthLayout className="p-4 flex items-center" activeKey="activity">
				<p className="text-base-content/60 text-center">
					This page shows your recent activity, but you haven't save any tea session yet. Start your tea
					journal by{" "}
					<Link to="/session/new" className="link link-primary">
						recording your first session!
					</Link>
				</p>

				<Link
					to="/session/new"
					className="absolute right-3 bottom-3 btn btn-primary rounded-full h-12 w-12 shadow-md"
				>
					<PlusIcon className="size-4" />
				</Link>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout className="p-4 pb-18" activeKey="activity">
			<p className="text-sm text-content/60">Your activity this year</p>
			<ActivityGraph className="my-2" />

			{0 !== items.length && (
				<>
					<ul className="mt-4">
						{Object.values(sessionsByDay).map((sessions) => {
							const date = sessions[0].drankAt;

							return (
								<li key={formatISO(date, { representation: "date" })} className="mb-12">
									<div className="leading-tight mb-4 text-lg">
										<span className="text-xs uppercase text-base-content/60">
											{formatDate(date, "yyyy")}
										</span>
										<br />
										<span>{formatDate(date, "d MMMM")}</span>
									</div>
									<ul>
										{sessions.map((session) => (
											<li key={session.id} className="mb-2">
												<Link to={`/me/sessions/${session.id}`}>
													<Item
														family={session.tea.family}
														type={session.tea.type}
														path={session.tea.originPath}
														note={session.note}
														grams={session.teaQuantity}
														ml={session.waterMl}
													/>
												</Link>
											</li>
										))}
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
}) {
	return (
		<article
			className={clsx("bg-base-200 rounded h-min-16 pt-2 pb-1 border-l-2", TEA_FAMILY_BORDER_CLS[props.family])}
		>
			<div className="px-3 flex justify-between text-xs text-base-content/60 leading-tight">
				<span className="uppercase text-base-content/40">{props.family}</span>
				{props.path && <FormatOriginPath originPath={props.path} />}
			</div>
			<div className="px-3 pb-1 flex">
				<span className="capitalize">{props.type?.name ?? `${props.family} tea`}</span>
				<span className="ml-auto">
					{[props.grams ? `${props.grams} g` : null, props.ml ? `${props.ml} ml` : null]
						.filter((v) => v)
						.join(" · ")}
				</span>
			</div>
			{!!props.note && (
				<div className="border-t border-base-300 pt-2 pb-1 px-3 text-base-content/60 text-sm">
					{limit(props.note, 96)}
				</div>
			)}
		</article>
	);
}
