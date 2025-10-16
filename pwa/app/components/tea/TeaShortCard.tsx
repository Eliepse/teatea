import { Family } from "~/components/tea/Family";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import Leaf from "~/components/icons/leaf";
import type { Cultivar, OriginPath, TeaFamily, TeaType } from "~t/types";
import clsx from "clsx";

export function TeaShortCard(props: {
	family: TeaFamily;
	type?: TeaType;
	path?: OriginPath;
	cultivar?: Cultivar;
	className?: string;
	noStyle?: boolean;
}) {
	return (
		<div
			className={clsx(
				"flex items-center px-3 py-2 rounded-md",
				true !== props.noStyle && "min-h-14 cursor-pointer select-none",
				props.className,
			)}
		>
			<div className="mr-auto">
				<Family family={props.family} iconOnly className="mr-2" />
				<span className="capitalize">{props.type?.name ?? `${props.family} tea`}</span>
			</div>

			<div className="text-xs text-base-content/60 leading-tight text-right">
				{props.path && (
					<div>
						<FormatOriginPath originPath={props.path} />
					</div>
				)}
				{props.cultivar && (
					<div className="flex items-center justify-end">
						<Leaf className="size-2.5 mr-0.5 text-base-content/60" />
						{props.cultivar.name}
					</div>
				)}
			</div>
		</div>
	);
}
