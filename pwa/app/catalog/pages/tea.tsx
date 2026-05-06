import type { Route } from "../../../.react-router/types/app/catalog/pages/+types/tea";
import { deleteApi, getApi, postApi } from "~/utils/api";
import { type ApiCollection, type MemberTea, type TeaStats } from "~t/types";
import { Link, useNavigate } from "react-router";
import { handleUIEvent } from "~/utils/function";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Leaf from "~/components/icons/leaf";
import WaterDrop from "~/components/icons/WaterDrop";
import { denormalizeTea, type TeaRaw } from "~/utils/api/normalization/tea";
import { CoffeeCup, Heart, HeartSolid, PeopleTag, Plus } from "iconoir-react";
import { useState } from "react";
import { IfAuthenticated } from "~/auth/components/voters/IfAuthenticated";
import { BrewButton } from "~/components/teaSession/BrewButton";
import { TeaCard } from "~/components/tea/TeaCard";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { AddToPersonalCollectionButton } from "~/components/tea/AddToPersonalCollectionButton";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";
import { WithMainMenu } from "~/layouts/WithMainMenu";
import { makeSessionCollectionOfTea } from "~/shared/query/teaSessionQuery";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const teaId = args.params.id;
	const tea = denormalizeTea(await (await getApi<TeaRaw>(`/teas/${teaId}`)).json());
	const favorites = await (await getApi<ApiCollection<MemberTea>>(`/lists/favorites/teas`, { tea: teaId })).json();
	const stats = await (await getApi<TeaStats>(`/teas/${teaId}/stats`)).json();
	return { tea, stats, favoriteTea: favorites.member[0] ?? null };
}

export default function TeaPage(props: Route.ComponentProps) {
	const { tea, stats } = props.loaderData;
	const navigate = useNavigate();
	const [favorite, setFavorite] = useState<MemberTea | null>(props.loaderData.favoriteTea);
	const sessionsQuery = useQuery(makeSessionCollectionOfTea(tea));

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
		<WithMainMenu className="pb-22 text-lg bg-green-50 min-h-dvh">
			<nav className="absolute inset-x-0 top-0 p-5 flex">
				<BackButton className="mr-auto" />

				<IfAuthenticated>
					<ul className="flex gap-2">
						<li>
							<button
								className="btn btn-lg bg-white btn-circle text-green-700"
								onClick={handleUIEvent(() => toggleFavorite.mutate())}
								disabled={toggleFavorite.isPending}
								aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
							>
								{favorite ? <HeartSolid className="size-6" /> : <Heart className="size-6" />}
							</button>
						</li>
					</ul>
				</IfAuthenticated>
			</nav>

			<img src="/img/tea-header-placeholder.jpg" className="h-40 w-full object-cover bg-green-300" alt="" />

			<header>
				<TeaCard
					family={tea.family}
					year={tea.year}
					roast={tea.roast}
					cultivar={tea.cultivar}
					type={tea.type}
					origin={tea.originPath}
					hideArrow
					className="-mt-12 mb-4 mx-4 relative z-10 bg-white shadow-sm"
				/>

				<nav className="mx-4 mb-8">
					<ul className="text-green-900 flex items-center justify-center gap-2">
						<IfAuthenticated>
							<li className="flex-1">
								<AddToPersonalCollectionButton tea={tea["@id"]}>
									<SecondaryButton className="w-full">
										My teas
										<Plus className="size-5 ml-auto" />
									</SecondaryButton>
								</AddToPersonalCollectionButton>
							</li>
						</IfAuthenticated>
						<IfAuthenticated>
							<li className="flex-1">
								<BrewButton tea={props.loaderData.tea["@id"]}>
									<PrimaryButton className="w-full text-lg">
										Brew
										<CoffeeCup className="size-5 ml-auto" />
									</PrimaryButton>
								</BrewButton>
							</li>
						</IfAuthenticated>
					</ul>
				</nav>
			</header>

			<main>
				{0 !== stats.sessionsCount && (
					<section className="grid grid-cols-2 gap-4 mx-4 leading-tight">
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

				<section className="px-4 mt-8">
					<h2 className="uppercase text-xs font-medium text-stone-500 mb-2">Tea sessions</h2>
					{sessionsQuery.isPending && (
						<div className="">
							<div className="skeleton h-12 mb-2" />
							<div className="skeleton h-12 mb-2" />
							<div className="skeleton h-12 mb-2" />
						</div>
					)}

					{!!sessionsQuery.data?.member?.length && (
						<ul>
							{sessionsQuery.data?.member?.map((session) => (
								<li className="mb-2" key={session.id}>
									<Link to={`/sessions/${session.id}`}>
										<article className="px-2 py-2 bg-white rounded-lg">
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
										</article>
									</Link>
								</li>
							))}
						</ul>
					)}

					{!sessionsQuery.data?.member?.length && (
						<p>
							This tea has not been
							<BrewButton tea={props.loaderData.tea["@id"]} className="inline">
								<SecondaryButton className="text-sm mx-1" small inline>
									Brewed
									<CoffeeCup className="size-4 ml-1" />
								</SecondaryButton>
								yet.
							</BrewButton>
						</p>
					)}
				</section>
			</main>
		</WithMainMenu>
	);
}
