import type { Route } from "../../../.react-router/types/app/pages/tea/+types/tea-type";
import { getApi } from "~/utils/api";
import { type TeaType } from "~t/types";
import { type ReactNode } from "react";
import { Family } from "~/components/tea/Family";
import { CoffeeCup, Leaderboard, LeaderboardStar, Leaf, NavArrowRight } from "iconoir-react";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { Link, type LinkProps } from "react-router";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const origin = args.params.origin;

	const teaType = await (
		await getApi<Omit<TeaType, "stats"> & { stats: Required<TeaType>["stats"] }>(
			`/tea_types/${args.params.slug}?origin=${origin}`,
		)
	).json();
	return { teaType };
}

export default function TeaTypePage(props: Route.ComponentProps) {
	const { teaType } = props.loaderData;
	const origin = teaType.origin;
	const countryPath = origin.path.split(".")[0];
	const stats = teaType.stats;

	return (
		<div className="pb-22 text-lg bg-green-50 min-h-dvh">
			<nav className="absolute inset-x-0 top-0 z-10 p-5 flex">
				<BackButton className="mr-auto" />
			</nav>

			<div className="px-2 pt-2 relative z-0">
				<img
					src="/img/tea-header-placeholder.jpg"
					className="h-56 rounded-3xl w-full object-cover bg-green-300"
					alt=""
				/>

				<div className="text-sm text-white/90 bg-teal-900/60 rounded-lg absolute bottom-4 right-6 px-2 py-1">
					No photos
				</div>
			</div>

			<header className="mt-4 px-6">
				<div className="text-base text-green-700">
					<Family className="capitalize" family={teaType.family} /> tea
				</div>
				<h1 className="mb-4 text-4xl font-header font-extrabold text-green-900">{teaType.name}</h1>
			</header>

			<main>
				<ul className="grid grid-cols-2 gap-2 my-8 mx-6">
					<li>
						<Stat
							value={
								<>
									<span className="text-base">#</span>
									{stats.rank}
								</>
							}
							icon={
								3 >= stats.rank ? (
									<LeaderboardStar className="inline-block size-6 relative top-0.5" />
								) : (
									<Leaderboard className="inline-block size-6 relative top-0.5" />
								)
							}
							label="popularity"
						/>
					</li>

					<li>
						<Stat
							value={stats.sessionsCount}
							icon={<CoffeeCup className="inline-block size-6 relative top-0.5" />}
							label="drink sessions"
						/>
					</li>

					<li className="col-span-2">
						<StatButton
							to={{ pathname: "/tea/search", search: `?type=${teaType.slug}&rootOrigin=${countryPath}` }}
							value={stats.teasCount}
							unit={1 < stats.teasCount ? "teas" : "tea"}
							icon={<Leaf className="size-6" />}
							label="of this type"
						/>
					</li>
				</ul>
			</main>
		</div>
	);
}

function Stat(props: { value: ReactNode; icon: ReactNode; label?: string }) {
	return (
		<div className="border-green-200 text-teal-600 rounded-lg px-3 py-3 bg-green-100 text-center">
			<div className="inline-flex items-center text-3xl font-bold text-green-900">
				{props.icon}
				<span className="ml-2">{props.value}</span>
			</div>
			{!!props.label && <div className="text-sm mt-1">{props.label}</div>}
		</div>
	);
}

function StatButton(props: { to: LinkProps["to"]; value: ReactNode; unit?: string; icon: ReactNode; label?: string }) {
	return (
		<Link to={props.to} className="flex items-center gap-5 px-5 h-20 bg-white rounded-lg shadow-sm">
			{props.icon}

			<span className="flex-1 leading-none">
				<span className="flex-1 font-header text-2xl font-bold text-green-900 block leading-none">
					{props.value} {props.unit}
				</span>
				<span className="leading-none text-sm">{props.label}</span>
			</span>

			<NavArrowRight className="size-6" />
		</Link>
	);
}
