import type { ReactNode } from "react";
import { ArrowRightCircle } from "iconoir-react";

export function UserStat(props: {
	title: ReactNode;
	value: number | string;
	icon: ReactNode;
	className?: string;
	withArrow?: boolean;
}) {
	return (
		<div className={props.className}>
			<div className="text-4xl font-bold font-header text-green-700">
				{props.value}
				{props.icon}
			</div>
			<div className="flex items-center text-sm">
				{props.title}
				{props.withArrow && (
					<ArrowRightCircle direction="right" className="size-3 ml-1 translate-y-0.5 inline" />
				)}
			</div>
		</div>
	);
}
