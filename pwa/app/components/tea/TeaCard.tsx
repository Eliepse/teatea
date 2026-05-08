import {
	type Business,
	type Cultivar,
	type Origin,
	type OriginPath,
	type RoastLevel,
	RoastLevelEnum,
	type TeaFamily,
	type TeaType,
} from "~t/types";
import clsx from "clsx";
import { FormatOrigin, FormatOriginPath } from "~/components/shared/FormatOriginPath";
import type { PropsWithChildren, ReactNode } from "react";
import { Family } from "~/components/tea/Family";
import { ArrowRight, Shop } from "iconoir-react";
import { Badge } from "~/components/shared/Badge";

export function TeaCard(
	props: PropsWithChildren<{
		family: TeaFamily;
		type?: TeaType;
		origin?: OriginPath | Origin;
		cultivar?: Cultivar;
		year?: number;
		roast?: RoastLevel;
		business?: Business;
		className?: string;
		showNoRoast?: boolean;
		loading?: boolean;
		onClick?: () => void;
		hideArrow?: boolean;
	}>,
) {
	const hasSpecs = Object.entries(props).some(
		([k, v]) => ["path", "cultivar", "year", "roast", "origin", "business"].includes(k) && !!v,
	);
	const roast = props.showNoRoast || RoastLevelEnum.No !== props.roast ? props.roast : null;

	return (
		<article className={clsx("rounded-2xl", props.className)}>
			<div className={clsx("py-2 px-4", !props.hideArrow && "cursor-pointer")} onClick={props.onClick}>
				<div className="flex gap-2 mb-1">
					<Family family={props.family} className="capitalize text-teal-800 text-sm" />
					{props.business && (
						<Badge color="lightGreen" icon={<Shop className="size-3" />} className="ml-auto" small>
							{props.business.name}
						</Badge>
					)}
				</div>
				<div className="flex justify-between items-center">
					<h1 className="font-header font-bold text-2xl text-green-800">
						{props.loading ? <span className="block w-40 h-6 mt-2 skeleton" /> : props.type?.name}
					</h1>
					{!props.hideArrow && <ArrowRight className="size-4 inline-block ml-3 flex-none opacity-70" />}
				</div>
			</div>

			{hasSpecs && (
				<div className="py-3 px-4 border-t border-dashed border-green-200 text-teal-800">
					<ul className="grid grid-cols-1 gap-2 gap-x-8 text-sm">
						{!!props.origin && (
							<TeaCardSpec
								label="Origin"
								value={
									"namePath" in props.origin ? (
										<FormatOrigin origin={props.origin} />
									) : (
										<FormatOriginPath originPath={props.origin} />
									)
								}
							/>
						)}

						{!!props.cultivar && <TeaCardSpec label="Cultivar" value={props.cultivar?.name} />}
						{!!props.year && <TeaCardSpec label="Year" value={props.year} />}
						{!!roast && <TeaCardSpec label="Roast" value={roast} />}
					</ul>
				</div>
			)}

			{!!props.children && <div className="border-t border-dashed border-green-200">{props.children}</div>}
		</article>
	);
}

export function TeaCardSpec(props: { label: string; value: ReactNode }) {
	return (
		<li className="flex justify-between items-center text-green-900">
			<span className="text-teal-600">{props.label}</span>
			<span>{props.value}</span>
		</li>
	);
}
