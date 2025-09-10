import type { OriginPath } from "~t/types";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import clsx from "clsx";

export function TeaShortCard(props: {
	title: string;
	onClick?: () => void;
	selected?: boolean;
	className?: string;
	originPath?: OriginPath;
	family: string;
	type?: string;
}) {
	const familyLabel = props.family[0].toUpperCase() + props.family.substring(1);

	if (!props.type) {
		const closestOrigin = props.originPath?.locality ?? props.originPath?.region ?? props.originPath?.country;

		return (
			<article
				className={clsx(
					"bg-base-200 rounded px-4 py-2 h-16",
					props.selected && "bg-primary text-white",
					props.className,
				)}
				onClick={props.onClick}
			>
				<div className="flex justify-between">
					<span
						className={clsx(
							"text-[.66rem] uppercase",
							props.selected ? "text-white" : "text-base-content/40",
						)}
					>
						{familyLabel}
					</span>
					<span
						className={clsx("text-xs text-right", props.selected ? "text-white" : "text-base-content/60")}
					>
						{props.originPath && (
							<FormatOriginPath
								originPath={props.originPath}
								maxLevel={closestOrigin === props.originPath?.locality ? "region" : "country"}
							/>
						)}
					</span>
				</div>
				<div>
					{familyLabel} tea{" "}
					<span className={clsx(props.selected ? "text-white" : "text-base-content/60")}>
						of {closestOrigin?.name}
					</span>
				</div>
			</article>
		);
	}

	return (
		<article
			className={clsx(
				"bg-base-200 rounded px-4 py-2 h-16",
				props.selected && "bg-primary text-white",
				props.className,
			)}
			onClick={props.onClick}
		>
			<div className="flex justify-between">
				<span
					className={clsx("text-[.66rem] uppercase", props.selected ? "text-white" : "text-base-content/40")}
				>
					{familyLabel}
				</span>
				<span className={clsx("text-xs text-right", props.selected ? "text-white" : "text-base-content/60")}>
					{props.originPath && <FormatOriginPath originPath={props.originPath} />}
				</span>
			</div>
			<div>
				<div className="">{props.type}</div>
			</div>
		</article>
	);
}
