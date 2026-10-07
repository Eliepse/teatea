import { Fragment } from "react";
import { useUser } from "~/auth/hooks/useUser";
import type { FeedItem } from "~t/types";
import clsx from "clsx";
import { extractId } from "~/utils/resource";
import { FeedItemContainer } from "~/social/components/FeedItemContainer";
import { Post } from "~/social/components/Post";
import { CoffeeCup } from "iconoir-react";
import { TeaSession } from "~/social/components/TeaSession";

export function FeedList(props: { items: Array<FeedItem> }) {
	const { data: user } = useUser();

	return (
		<ul>
			{props.items.map((feedItem) => (
				<li
					key={feedItem.item["@id"]}
					className={clsx("py-3 px-4", user?.username === extractId(feedItem.author) && "bg-green-100")}
				>
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
		</ul>
	);
}
