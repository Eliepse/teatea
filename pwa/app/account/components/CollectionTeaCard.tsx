import type { MediaObject, Tea } from "~t/types";
import { Family } from "~/components/tea/Family";
import { FormatOrigin } from "~/components/shared/FormatOriginPath";
import { Calendar, Shop } from "iconoir-react";
import { DottedInlineList } from "~/components/shared/DottedInlineList";
import { Badge } from "~/components/shared/Badge";

export function CollectionTeaCard(props: {
	tea: Tea;
	description?: string;
	acquiredAt?: Date;
	thumbnail?: MediaObject;
}) {
	const hasMeta = !!props.acquiredAt || !!props.tea.business;

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

			{hasMeta && (
				<div className="text-sm px-4 text-stone-600">
					{!!props.tea.business && (
						<div className="mt-1">
							<Badge color="lightGreen" icon={<Shop className="size-4" />} small>
								{props.tea.business.name}
							</Badge>
						</div>
					)}
					{!!props.acquiredAt && (
						<div className="mt-1">
							<Badge icon={<Calendar className="size-4" />} small>
								{props.acquiredAt.toLocaleDateString()}
							</Badge>
						</div>
					)}
				</div>
			)}
		</article>
	);
}
