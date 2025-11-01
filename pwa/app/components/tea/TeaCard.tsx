import type { Cultivar, OriginPath, RoastLevel, TeaFamily, TeaType } from "~t/types";
import clsx from "clsx";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import type { PropsWithChildren, ReactNode } from "react";
import { Family } from "~/components/tea/Family";

export function TeaCard(
	props: PropsWithChildren<{
		family: TeaFamily;
		type?: TeaType;
		origin?: OriginPath;
		cultivar?: Cultivar;
		year?: number;
		roast?: RoastLevel;
		className?: string;
		loading?: boolean;
	}>,
) {
	const hasSpecs = Object.keys(props).some((key) => ["path", "cultivar", "year", "roast"].includes(key));

	return (
		<article className={clsx("rounded-2xl", props.className)}>
			<div className="py-2 px-4">
				<Family family={props.family} className="capitalize text-teal-800 text-sm mb-1" />
				<h1 className="font-header font-bold text-2xl text-green-800">
					{props.loading ? <span className="block w-40 h-6 mt-2 skeleton" /> : props.type?.name}
				</h1>
			</div>

			{hasSpecs && (
				<div className="py-3 px-4 border-t border-dashed border-green-200 text-teal-800">
					<ul className="grid grid-cols-1 gap-2 gap-x-8 text-sm">
						{!!props.origin && (
							<Spec label="Origin" value={<FormatOriginPath originPath={props.origin} />} />
						)}
						{!!props.cultivar && <Spec label="Cultivar" value={props.cultivar?.name} />}
						{!!props.year && <Spec label="Year" value={props.year} />}
						{!!props.roast && <Spec label="Roast" value={props.roast} />}
					</ul>
				</div>
			)}

			{!!props.children && <div className="border-t border-dashed border-green-200">{props.children}</div>}
		</article>
	);
}

function Spec(props: { label: string; value: ReactNode }) {
	return (
		<li className="flex justify-between items-center text-green-900">
			<span className="text-teal-600">{props.label}</span>
			<span>{props.value}</span>
		</li>
	);
}
