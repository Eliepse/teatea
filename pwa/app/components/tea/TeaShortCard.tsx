import { Family } from "~/components/tea/Family";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import Leaf from "~/components/icons/leaf";
import type { Cultivar, OriginPath, TeaFamily, TeaType } from "~t/types";
import clsx from "clsx";
import { type ReactNode, useMemo } from "react";

export function TeaShortCard(props: {
	family: TeaFamily;
	type?: TeaType;
	path?: OriginPath;
	cultivar?: Cultivar;
	year?: number;
	className?: string;
	noStyle?: boolean;
}) {
	const specs = useMemo(() => {
		const components: ReactNode[] = [];

		if (props.cultivar) {
			components.push(
				<span className="inline-flex items-center justify-end ml-1">
					<Leaf className="size-2.5 mr-0.5 text-base-content/60" />
					{props.cultivar.name}
				</span>,
			);
		}

		if (props.year) {
			components.push(<span className="ml-1">{props.year}</span>);
		}

		if (1 >= components.length) {
			return components;
		}

		const children: ReactNode[] = [];

		for (let i = 0; i < components.length; i++) {
			children.push(components[i]);
			children.push(<span className="ml-1">&middot;</span>);
		}

		return children.slice(0, -1);
	}, [props.cultivar, props.year]);

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
				<div>{props.path && <FormatOriginPath originPath={props.path} />}</div>
				<div>{specs}</div>
			</div>
		</div>
	);
}
