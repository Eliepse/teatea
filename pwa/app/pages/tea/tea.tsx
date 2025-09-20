import type { Route } from "../../../.react-router/types/app/pages/tea/+types/tea";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, TeaSession, TeaStats } from "~t/types";
import { Link, useNavigate } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import { useQuery } from "@tanstack/react-query";
import { denormalizeTeaSession, type TeaSessionRaw } from "~/utils/api/normalization/teaSession";
import { formatDistanceToNow, intlFormat } from "date-fns";
import Leaf from "~/components/icons/leaf";
import WaterDrop from "~/components/icons/WaterDrop";
import { limit } from "~/utils/text";
import clsx from "clsx";
import { denormalizeTea, type TeaRaw } from "~/utils/api/normalization/tea";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const tea = denormalizeTea(await (await getApi<TeaRaw>(`/teas/${args.params.id}`)).json());
	const stats = await (await getApi<TeaStats>(`/teas/${args.params.id}/stats`)).json();
	return { tea, stats };
}

const TEA_FAMILY_BADGE_CLS = {
	yellow: "badge-warning",
	white: "badge-neutral badge-outline bg-white",
	green: "badge-success",
	wulong: "badge-info",
	black: "badge-error text-white",
	fermented: "badge-neutral",
} as const;

const TEA_FAMILY_BORDER_CLS = {
	yellow: "border-lime-200",
	white: "border-cyan-200",
	green: "border-green-300",
	wulong: "border-indigo-300",
	black: "border-orange-300",
	fermented: "border-stone-500",
} as const;

export default function TeaPage(props: Route.ComponentProps) {
	const { tea, stats } = props.loaderData;
	const navigate = useNavigate();
	const familyLabel = tea.family[0].toUpperCase() + tea.family.substring(1) + " tea";
	const origin = tea.originPath?.locality ?? tea.originPath?.region ?? tea.originPath?.country;

	const sessionsQuery = useQuery({
		queryFn: async (): Promise<ApiPaginatedCollection<TeaSession>> => {
			const response = await getApi<ApiPaginatedCollection<TeaSessionRaw>>(
				`/tea_sessions?tea=${tea.id}&itemsPerPage=5&contentful=1`,
			);
			const payload = await response.json();
			return { ...payload, member: payload.member.map(denormalizeTeaSession) };
		},
		queryKey: ["page", tea["@id"], "sessions"],
	});

	return (
		<div className="pb-22">
			<header className={clsx("p-4 bg-stone-50 border-t-3", TEA_FAMILY_BORDER_CLS[tea.family])}>
				<button className="btn btn-ghost p-0 mb-4" onClick={handleUIEvent(() => navigate(-1))}>
					<ArrowLeftIcon className="size-4 mr-1" /> Back
				</button>

				<h1 className="text-3xl mb-2">{tea.type?.name ?? familyLabel}</h1>

				<ul className="flex gap-2">
					{!!tea.type && (
						<li>
							<div className={clsx("badge", TEA_FAMILY_BADGE_CLS[tea.family])}>{tea.family} tea</div>
						</li>
					)}

					{!!tea.originPath && (
						<li>
							<Link
								className="badge badge-soft badge-neutral"
								to={`/tea/search?originPath=${origin?.path}`}
							>
								<FormatOriginPath originPath={tea.originPath} />
							</Link>
						</li>
					)}
				</ul>
			</header>

			<main>
				{0 !== stats.sessionsCount && (
					<div className="px-4 mt-4">
						<p>
							This tea has been brewed{" "}
							<strong>
								{stats.sessionsCount}&nbsp;{1 === stats.sessionsCount ? "time" : "times"}
							</strong>{" "}
							times by a total of{" "}
							<strong>
								{stats.authorsCount}&nbsp;{1 === stats.authorsCount ? "member" : "members"}.
							</strong>
						</p>
					</div>
				)}

				{sessionsQuery.isPending && (
					<div className="px-4 mt-8">
						<div className="skeleton h-8 mb-2" />
						<div className="skeleton h-8 mb-2" />
						<div className="skeleton h-8 mb-2" />
					</div>
				)}

				{0 !== (sessionsQuery.data?.member?.length ?? 0) && (
					<section className="px-4 mt-8">
						<h2 className="text-lg mb-4">How others brewed it?</h2>
						<ul>
							{sessionsQuery.data?.member?.map((session) => (
								<li className="mb-2" key={session.id}>
									<Link to={`/sessions/${session.id}`}>
										<article className="px-2 py-2 bg-base-200 rounded">
											<div className="flex text-xs gap-2 items-center">
												{!!session.teaQuantity && (
													<div className="flex justify-between items-center rounded-md border leading-1 border-gray-400 p-1.5">
														<Leaf className="size-3 text-green-300 mr-2" />
														<span>{`${session.teaQuantity} g`}</span>
													</div>
												)}

												{!!session.waterMl && (
													<div className="flex justify-between items-center rounded-md border leading-1 border-gray-400 p-1.5">
														<WaterDrop className="size-3 text-blue-300 mr-2" />
														<span>{`${session.waterMl} ml`}</span>
													</div>
												)}

												<div className="ml-auto text-sm text-base-content/60">
													{formatDistanceToNow(session.drankAt)} ago
												</div>
											</div>
											{!!session.note && (
												<p className="mt-4 pt-2 italic border-t border-gray-300 text-sm text-base-content/70">
													{limit(session.note, 96)}
												</p>
											)}
										</article>
									</Link>
								</li>
							))}
						</ul>
					</section>
				)}
			</main>

			<footer className="px-4 mt-16 text-xs text-base-content/60">
				Created at {intlFormat(tea.addedAt, { dateStyle: "long" })}
			</footer>

			<Link
				to={`/session/new?tea=${tea.id}`}
				className="fixed bottom-4 right-4 btn btn-primary rounded-full h-12"
			>
				Brew it
			</Link>
		</div>
	);
}
