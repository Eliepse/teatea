import clsx from "clsx";
import type { Cultivar, Origin, TeaType } from "~t/types";
import Leaf from "../icons/leaf";

export function TeaCard(props: {
	name?: string;
	typePath?: TeaType[];
	originPath?: Origin[];
	cultivar?: Cultivar;
	selected?: boolean;
	className?: string;
}) {
	const type = props.typePath?.slice(-1)[0];
	const parentTypes = props.typePath?.slice(0, -1);
	const origins = props.originPath?.slice(0, 2);

	return (
		<div
			className={clsx("flex px-4 py-2 items-center", props.selected && "bg-primary text-white", props.className)}
		>
			<div className="flex-1">
				{!!parentTypes?.length && (
					<div className={clsx("text-xs mb-1", props.selected ? "text-white" : "text-base-content/50")}>
						{parentTypes.map((t) => t.name).join(" · ")}
					</div>
				)}
				<div className="font-semibold">{props.name ?? type?.name}</div>
			</div>
			<div className="text-right text-xs">
				{!!origins?.length && <div className="mb-1">{origins.map((t) => t.name).join(" · ")}</div>}
				<div className={clsx(props.selected ? "text-white" : "text-base-content/50")}>
					&nbsp;
					{!!props.cultivar && (
						<>
							{props.cultivar.name} <Leaf className="size-3 text-green-400 inline" />
						</>
					)}
				</div>
			</div>
		</div>
	);
}
