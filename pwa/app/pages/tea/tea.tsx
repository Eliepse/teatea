import type { Route } from "../../../.react-router/types/app/pages/tea/+types/tea";
import styles from "./tea.module.css";
import { deleteApi, getApi, postApi } from "~/utils/api";
import {
	type ApiCollection,
	type ApiPaginatedCollection,
	type Cultivar,
	type MemberTea,
	type OriginPath,
	type RoastLevel,
	RoastLevelEnum,
	type TeaFamily,
	type TeaSession,
	type TeaStats,
} from "~t/types";
import { Link, useNavigate } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";
import { useMutation, useQuery } from "@tanstack/react-query";
import { denormalizeTeaSession, type TeaSessionRaw } from "~/utils/api/normalization/teaSession";
import { formatDistanceToNow } from "date-fns";
import Leaf from "~/components/icons/leaf";
import WaterDrop from "~/components/icons/WaterDrop";
import { limit } from "~/utils/text";
import { denormalizeTea, type TeaRaw } from "~/utils/api/normalization/tea";
import { CoffeeCup, Heart, HeartSolid, PeopleTag } from "iconoir-react";
import { type ReactNode, useState } from "react";
import { IfAuthenticated } from "~/auth/components/voters/IfAuthenticated";
import { Family } from "~/components/tea/Family";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import { RoastLevelLabel } from "~/components/shared/RoastLevelLabel";
import clsx from "clsx";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const tea = denormalizeTea(await (await getApi<TeaRaw>(`/teas/${args.params.id}`)).json());
	const favorites = await (
		await getApi<ApiCollection<MemberTea>>(`/lists/favorites/teas`, { tea: args.params.id })
	).json();
	const stats = await (await getApi<TeaStats>(`/teas/${args.params.id}/stats`)).json();

	return { tea, stats, favoriteTea: favorites.member[0] ?? null };
}

export default function TeaPage(props: Route.ComponentProps) {
	const { tea, stats } = props.loaderData;
	const navigate = useNavigate();
	const [favorite, setFavorite] = useState<MemberTea | null>(props.loaderData.favoriteTea);

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

	const toggleFavorite = useMutation({
		mutationFn: async () => {
			if (favorite) {
				await deleteApi(favorite);
				return null;
			} else {
				return await (await postApi<MemberTea>(`/lists/favorites/teas`, { tea: tea["@id"] })).json();
			}
		},
		onSuccess: (payload) => setFavorite(payload),
	});

	return (
		<div className="pb-22 text-lg bg-green-50 min-h-dvh">
			<nav className="absolute inset-x-0 top-0 p-5 flex">
				<button
					className="btn btn-lg btn-circle bg-white mr-auto"
					onClick={() => navigate(-1)}
					aria-label="Go back"
				>
					<ArrowLeftIcon className="size-6" />
				</button>

				<IfAuthenticated>
					<button
						className="btn btn-lg bg-white btn-circle text-secondary"
						onClick={handleUIEvent(() => toggleFavorite.mutate())}
						disabled={toggleFavorite.isPending}
						aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
					>
						{favorite ? <HeartSolid className="size-6" /> : <Heart className="size-6" />}
					</button>
				</IfAuthenticated>
			</nav>

			<img src="/img/tea-header-placeholder.jpg" className="h-40 w-full object-cover bg-green-300" alt="" />

			<header className="pt-6 pb-0 relative bg-green-50 -mt-6 rounded-t-3xl">
				<h1 className="mx-6 mb-5 text-3xl font-bold tracking-wide text-green-900">{tea.type?.name}</h1>

				<Specs
					family={tea.family}
					origin={tea.originPath}
					roast={tea.roast && RoastLevelEnum.No !== tea.roast ? tea.roast : undefined}
					cultivar={tea.cultivar}
					year={tea.year}
					className="mx-6 py-4 border-t border-green-200"
				/>

				<nav className="fixed bottom-4 inset-x-4 flex items-center justify-center">
					<Link to={`/session/new?tea=${tea.id}`} className="btn btn-lg btn-primary rounded-full">
						Brew it
						<CoffeeCup className="ml-1 size-5" />
					</Link>
				</nav>
			</header>

			<main>
				{0 !== stats.sessionsCount && (
					<section className="grid grid-cols-2 gap-2 mx-4 leading-tight">
						<div className="border-green-200 text-teal-600 rounded-lg px-6 py-3 bg-green-100 text-center">
							<div className="inline-flex items-center text-3xl font-bold text-green-900">
								<PeopleTag className="inline-block mr-2 size-6" />
								{stats.authorsCount}
							</div>
							<div className="text-sm mt-1">People tried it</div>
						</div>

						<div className="border-green-200 text-teal-600 rounded-lg px-6 py-3 bg-green-100 text-center">
							<div className="inline-flex items-center text-3xl font-bold text-green-900">
								<CoffeeCup className="inline-block mr-2 size-6" />
								{stats.sessionsCount}
							</div>
							<div className="text-sm mt-1">Times prepared</div>
						</div>
					</section>
				)}

				{sessionsQuery.isPending && (
					<div className="px-4 mt-8 hidden">
						<div className="skeleton h-8 mb-2" />
						<div className="skeleton h-8 mb-2" />
						<div className="skeleton h-8 mb-2" />
					</div>
				)}

				{0 !== (sessionsQuery.data?.member?.length ?? 0) && (
					<section className="px-4 mt-8 hidden">
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
		</div>
	);
}

function Specs(props: {
	family?: TeaFamily;
	origin?: OriginPath;
	roast?: RoastLevel;
	cultivar?: Cultivar;
	year?: number;
	className?: string;
}) {
	// No specs to display
	if (false === Object.keys(props).some((k) => "className" !== k)) {
		return null;
	}

	return (
		<ul className={clsx(styles.specs, props.className)}>
			{!!props.family && (
				<SpecItem
					label="Type"
					value={
						<span>
							<Family family={props.family} className="capitalize" /> tea
						</span>
					}
				/>
			)}
			{!!props.origin && <SpecItem label="Origin" value={<FormatOriginPath originPath={props.origin} />} />}
			{!!props.cultivar && <SpecItem label="Cultivar" value={props.cultivar.name} />}
			{!!props.year && <SpecItem label="Harvest" value={props.year} />}
			{!!props.roast && <SpecItem label="Roast" value={<RoastLevelLabel roast={props.roast} showNotRoasted />} />}
		</ul>
	);
}

function SpecItem(props: { label: string; value: ReactNode }) {
	return (
		<li className={styles.specsItem}>
			<span className="text-base text-teal-600">{props.label}</span>
			{props.value}
		</li>
	);
}
