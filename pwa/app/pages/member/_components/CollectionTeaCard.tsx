import type { Business, MediaObject, Tea } from "~t/types";
import { Family } from "~/components/tea/Family";
import { FormatOrigin } from "~/components/shared/FormatOriginPath";
import { Calendar, Shop } from "iconoir-react";
import { DottedInlineList } from "~/components/shared/DottedInlineList";
import clsx from "clsx";

export function CollectionTeaCard(props: {
	tea: Tea;
	description?: string;
	acquiredAt?: Date;
	acquiredFrom?: Business;
	thumbnail?: MediaObject;
}) {
	const hasMeta = props.acquiredAt || props.acquiredFrom;

	return (
		<article className="bg-white rounded-xl shadow-xs overflow-hidden py-2">
			<div className="flex items-center pl-4 pr-2 min-h-14">
				<div className="flex-1">
					<div>
						<Family family={props.tea.family} iconOnly className="mr-1" />
						<span className="capitalize">{props.tea.type?.name ?? `${props.tea.family} tea`}</span>
					</div>
					<div className="text-sm text-teal-600">
						<DottedInlineList dotClassName="mx-1">
							{props.tea.cultivar && (
								<span className="text-teal-600 text-sm">{props.tea.cultivar.name}</span>
							)}
							{props.tea.origin && <FormatOrigin origin={props.tea.origin} maxLevel="region" />}
							{props.tea.year && <span className="text-teal-600 text-sm">{props.tea.year}</span>}
						</DottedInlineList>
					</div>
				</div>

				{props.thumbnail && (
					<img
						src={props.thumbnail?.contentUrl}
						loading="lazy"
						style={{ backgroundImage: `url(data:image/webp;base64,${props.thumbnail?.placeholder})` }}
						className="aspect-square h-14 object-cover bg-center bg-cover rounded-lg bg-green-100"
						alt=""
					/>
				)}
			</div>

			{hasMeta && <hr className={clsx("border-stone-200 mx-4 mt-1 mb-2", props.thumbnail && "mr-20")} />}

			{hasMeta && (
				<div className="text-sm px-4 text-stone-600">
					{!!props.acquiredFrom && (
						<div className="mr-4">
							<Shop className="inline size-4 mr-1 relative bottom-0.5" />
							{props.acquiredFrom.name}
						</div>
					)}

					{!!props.acquiredAt && (
						<div>
							<Calendar className="inline size-4 mr-1 relative bottom-0.5" />
							{props.acquiredAt.toLocaleDateString()}
						</div>
					)}
				</div>
			)}
		</article>
	);
}
