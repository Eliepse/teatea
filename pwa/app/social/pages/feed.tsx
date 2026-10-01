import { Post, PostSkeleton } from "~/social/components/Post";
import { WithMainMenu } from "~/layouts/WithMainMenu";
import { useInfiniteQuery } from "@tanstack/react-query";
import { extractId } from "~/utils/resource";
import { Fragment } from "react";
import { makeFeedInfiniteOpt } from "~/social/query/feedQuery";
import { DashedButton } from "~/shared/components/Button";
import { TeaSession } from "~/social/components/TeaSession";
import { FeedPostInput } from "~/social/components/FeedPostInput";
import { FeedItemContainer } from "~/social/components/FeedItemContainer";
import { CoffeeCup } from "iconoir-react";
import { useUser } from "~/auth/hooks/useUser";
import clsx from "clsx";

export async function clientLoader() {}

export default function FeedPage() {
	const feedQuery = useInfiniteQuery(makeFeedInfiniteOpt(undefined, { itemsPerPage: 16 }));
	const { data: user } = useUser();

	return (
		<WithMainMenu activeKey="feed" className="py-4">
			<FeedPostInput className="mx-4 mb-8" />

			<ul>
				{feedQuery.isLoading && (
					<Fragment>
						<li className="py-3 px-4">
							<PostSkeleton />
						</li>
						<li className="py-3 px-4">
							<PostSkeleton />
						</li>
						<li className="py-3 px-4">
							<PostSkeleton />
						</li>
						<li className="py-3 px-4">
							<PostSkeleton />
						</li>
					</Fragment>
				)}
				{feedQuery.data?.pages?.map((page) =>
					page.member.map((feedItem) => (
						<li
							key={feedItem.item["@id"]}
							className={clsx(
								"py-3 px-4",
								user?.username === extractId(feedItem.author) && "bg-green-100",
							)}
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
					)),
				)}
			</ul>

			<div>
				{feedQuery.hasNextPage && (
					<DashedButton className="" onClick={() => feedQuery.fetchNextPage()}>
						Next page
					</DashedButton>
				)}
			</div>
		</WithMainMenu>
	);
}
