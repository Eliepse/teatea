import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Fragment, type MouseEvent } from "react";
import type { loader } from "~/api/teaware";
import Chevron from "~/components/icons/chevron";
import { teawareTypes, type TeawareType } from "~t/teawareType";
import type { Teaware } from "~t/types";

type TeawareByType = { [key in TeawareType]: Teaware[] };

async function teawareByType(): Promise<TeawareByType> {
	const teawares = await ((await fetch("/api/teaware")).json() as ReturnType<typeof loader>);
	return teawares.reduce<TeawareByType>((carr, teaware) => {
		if (!carr[teaware.type]) {
			carr[teaware.type] = [];
		}

		carr[teaware.type].push(teaware);
		return carr;
	}, {} as TeawareByType);
}

export function SelectTeaware(props: { onSelect: (value: Teaware) => void; className?: string }) {
	const query = useQuery({
		queryKey: ["teaware", "byType"],
		queryFn: teawareByType,
	});

	function selectItem(e: MouseEvent, item: Teaware) {
		e.stopPropagation();
		props.onSelect(item);
	}

	if (query.isError) {
		return (
			<ul className={clsx("list", props.className)}>
				<li className="list-row">Failed to fetch teawares</li>
			</ul>
		);
	}

	if (query.isFetching) {
		return (
			<ul className={clsx("list", props.className)}>
				{Array(5)
					.fill(null)
					.map((_, i) => (
						<li key={i} className="list-row">
							<div className="list-col-grow skeleton h-8 w-full"></div>
						</li>
					))}
			</ul>
		);
	}

	return (
		<ul className={clsx("list", props.className)}>
			{query.data &&
				Object.entries(query.data).map(([type, teawares]) => (
					<Fragment key={type}>
						<li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
							{teawareTypes[type as TeawareType]}
						</li>
						{teawares.map((teaware) => (
							<li
								key={teaware.id}
								className="list-row cursor-pointer"
								onClick={(e) => selectItem(e, teaware)}
							>
								<div className="list-col-grow">{teaware.name}</div>
								<div>
									<Chevron direction="right" className="size-4" />
								</div>
							</li>
						))}
					</Fragment>
				))}
		</ul>
	);
}
