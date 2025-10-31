import type { Route } from "../../../.react-router/types/app/pages/tea/+types/tea-type";
import styles from "./tea.module.css";
import { getApi } from "~/utils/api";
import { type Cultivar, type OriginPath, type RoastLevel, type TeaFamily, type TeaType } from "~t/types";
import { useNavigate } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { type ReactNode } from "react";
import { Family } from "~/components/tea/Family";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import { RoastLevelLabel } from "~/components/shared/RoastLevelLabel";
import clsx from "clsx";
import { WarningTriangle } from "iconoir-react";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const teaType = await (await getApi<TeaType>(`/tea_types/${args.params.slug}`)).json();
	return { teaType };
}

export default function TeaTypePage(props: Route.ComponentProps) {
	const { teaType } = props.loaderData;
	const navigate = useNavigate();

	return (
		<div className="pb-22 text-lg bg-green-50 min-h-dvh">
			<nav className="absolute inset-x-0 top-0 z-10 p-5 flex">
				<button
					className="btn btn-lg btn-circle bg-white mr-auto"
					onClick={() => navigate(-1)}
					aria-label="Go back"
				>
					<ArrowLeftIcon className="size-6" />
				</button>
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

				<p className="text-green-800">Japanese green tea not as popular as Sencha or Matcha, but that is still well appreciated.</p>
			</header>

			<main>
				<section className="text-center mx-auto max-w-xs my-16 border border-yellow-400 bg-yellow-50 rounded-lg p-4 text-yellow-800">
					<WarningTriangle className="size-8 inline-block mb-4" />
					<p>This page is still under construction</p>
				</section>
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
