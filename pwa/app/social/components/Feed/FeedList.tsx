import { Fragment, useMemo } from "react";
import type { FeedItem } from "~t/types";
import { extractId } from "~/utils/resource";
import { FeedItemContainer } from "~/social/components/Feed/FeedItemContainer";
import { Post } from "~/social/components/Post";
import { CoffeeCup } from "iconoir-react";
import { TeaSession } from "~/social/components/TeaSession";
import {
	differenceInHours,
	formatDate,
	formatDistanceToNowStrict,
	formatISO,
	isAfter,
	isThisYear,
	isToday,
	isYesterday,
	subDays,
	subHours,
} from "date-fns";

function generateGroupKey(publishedAt: Date): string | number {
	// Last few hours (group by the hour)
	if (isToday(publishedAt) && isAfter(publishedAt, subHours(new Date(), 4))) {
		return differenceInHours(publishedAt, new Date());
	}

	// Group by days
	return formatISO(publishedAt, { representation: "date" });
}

function generateGroupTitle(publishedAt: Date): string {
	if (isYesterday(publishedAt)) {
		return "yesterday";
	}

	// Last few hours (group by the hour)
	if (isAfter(publishedAt, subHours(new Date(), 4))) {
		return "less than " + formatDistanceToNowStrict(publishedAt, { unit: "hour", roundingMethod: "ceil" });
	}

	if (isToday(publishedAt)) {
		return "today";
	}

	// 3 days at most
	if (isAfter(publishedAt, subDays(new Date(), 3))) {
		return formatDistanceToNowStrict(publishedAt, { addSuffix: true, unit: "day" });
	}

	if (isThisYear(publishedAt)) {
		return formatDate(publishedAt, "d MMMM");
	}

	return formatDate(publishedAt, "d MMM. yyyy");
}

export function FeedList(props: { items: Array<FeedItem>; highlightSelf?: boolean }) {
	const groupByPeriods = useMemo(() => {
		const groups = new Map<number | string, FeedItem[]>();

		for (const item of props.items) {
			const groupKey = generateGroupKey(item.publishedAt);
			let group = groups.get(groupKey);

			if (!group) {
				group = [];
				groups.set(groupKey, group);
			}

			group.push(item);
		}

		return Array.from(groups.entries());
	}, [props.items]);

	return (
		<ul>
			{0 === props.items.length && (
				<li className="py-8 px-4 text-green-700">
					<CoffeeCup className="size-7 block mb-4 mx-auto text-center text-green-700" />

					<p className="text-lg  text-center">There isn't any news to display!</p>
				</li>
			)}

			{groupByPeriods.map(([key, items]) => (
				<Fragment key={key}>
					<li className="mt-16 mb-4 px-2 text-sm text-right text-stone-500">
						{generateGroupTitle(items[0].publishedAt)}
					</li>

					{items.map((feedItem) => (
						<li key={feedItem.item["@id"]} className="px-2 mb-4">
							{"Post" === feedItem.item["@type"] && (
								<FeedItemContainer
									id={feedItem.item.id}
									author={feedItem.item.author}
									publishedAt={feedItem.publishedAt}
								>
									<Post
										createdAt={feedItem.item.createdAt}
										author={{ username: extractId(feedItem.item.author) }}
										content={feedItem.item.content}
										images={feedItem.item.photos ?? []}
									/>
								</FeedItemContainer>
							)}

							{"TeaSession" === feedItem.item["@type"] && (
								<FeedItemContainer
									id={feedItem.item.id}
									author={feedItem.item.author}
									publishedAt={feedItem.publishedAt}
									action={
										<Fragment>
											drank a {feedItem.item.brewingType ?? ""} tea
											<CoffeeCup className="size-3 ml-1 inline-block relative bottom-0.5" />
										</Fragment>
									}
								>
									<TeaSession
										id={feedItem.item.id}
										author={feedItem.item.author}
										tea={feedItem.item.tea}
										className=""
									/>
								</FeedItemContainer>
							)}
						</li>
					))}
				</Fragment>
			))}
		</ul>
	);
}
