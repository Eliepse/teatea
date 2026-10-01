import { type Iri, type TeaSession } from "~t/types";
import clsx from "clsx";
import { useNavigate } from "react-router";
import { FormatOrigin } from "~/components/shared/FormatOriginPath";
import { Shop } from "iconoir-react";
import { Family } from "~/components/tea/Family";

export function TeaSession(props: { id: number; author: Iri; className?: string; tea: TeaSession["tea"] }) {
	const navigate = useNavigate();

	return (
		<div
			className={clsx("relative text-stone-800 pl-4 pr-6 py-2 overflow-hidden", props.className)}
			onClick={() => navigate(`/sessions/${props.id}`)}
		>
			<div className="mb-0">
				<span className="text-green-900">{props.tea.type?.name}</span>
				{props.tea.cultivar && <span className="text-xs text-stone-500 ml-1">({props.tea.cultivar.name})</span>}
				{props.tea.year && <span className="text-xs text-stone-500 ml-1">&middot; {props.tea.year}</span>}
			</div>
			<div className="text-sm text-stone-500 whitespace-nowrap truncate">
				{props.tea.origin && <FormatOrigin origin={props.tea.origin} />}
				{props.tea.origin && props.tea.business && <span className="mx-2">&middot;</span>}
				{props.tea.business && (
					<span className="">
						<Shop className="size-3 inline-block mr-1 relative bottom-0.5" />
						{props.tea.business.name}
					</span>
				)}
			</div>

			<Family family={props.tea.family} className="absolute right-2 top-2 text-lg" iconOnly />
		</div>
	);
}

// function Tag()