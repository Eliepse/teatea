import { Post, PostSkeleton } from "~/social/components/Post";
import { WithMainMenu } from "~/layouts/WithMainMenu";
import { useInfiniteQuery } from "@tanstack/react-query";
import { makePostInfiniteOpt } from "~/social/query/postQuery";
import { extractId } from "~/utils/resource";
import { Fragment } from "react";

export async function clientLoader() {}

export default function FeedPage() {
	const postsQuery = useInfiniteQuery(makePostInfiniteOpt({}));

	return (
		<WithMainMenu activeKey="activity" className="p-4">
			<ul>
				{postsQuery.isLoading && (
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
				{postsQuery.data?.pages?.map((page) =>
					page.member.map((post) => (
						<li key={post.id} className="mb-4">
							<Post
								createdAt={post.createdAt}
								author={{ username: extractId(post.author) }}
								content={post.content}
							/>
						</li>
					)),
				)}
			</ul>
		</WithMainMenu>
	);
}
