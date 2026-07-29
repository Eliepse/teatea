import { Post, PostSkeleton } from "~/social/components/Post";
import { WithMainMenu } from "~/layouts/WithMainMenu";
import { useInfiniteQuery } from "@tanstack/react-query";
import { extractId } from "~/utils/resource";
import { Fragment } from "react";
import { makeFeedInfiniteOpt } from "~/social/query/feedQuery";
import { DashedButton } from "~/shared/components/Button";
import { TeaSession } from "~/social/components/TeaSession";
import { FeedPostInput } from "~/social/components/FeedPostInput";

export async function clientLoader() {}

export default function FeedPage() {
	const feedQuery = useInfiniteQuery(makeFeedInfiniteOpt(undefined, { itemsPerPage: 16 }));

	return (
		<WithMainMenu activeKey="feed" className="p-4">
			<FeedPostInput className="mb-8" />

			<ul>
				{feedQuery.isLoading && (
					<Fragment>
						<li className="mb-4">
							<PostSkeleton />
						</li>
						<li className="mb-4">
							<PostSkeleton />
						</li>
						<li className="mb-4">
							<PostSkeleton />
						</li>
						<li className="mb-4">
							<PostSkeleton />
						</li>
					</Fragment>
				)}
				{feedQuery.data?.pages?.map((page) =>
					page.member.map((feedItem) => (
						<li key={feedItem.item["@id"]} className="mb-4">
							{"Post" === feedItem.item["@type"] && (
								<Post
									createdAt={feedItem.item.createdAt}
									author={{ username: extractId(feedItem.item.author) }}
									content={feedItem.item.content}
								/>
							)}
							{"TeaSession" === feedItem.item["@type"] && (
								<TeaSession
									id={feedItem.item.id}
									author={feedItem.item.author}
									tea={feedItem.item.tea}
									className="mx-2"
								/>
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
