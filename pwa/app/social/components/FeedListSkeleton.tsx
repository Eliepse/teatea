import { PostSkeleton } from "~/social/components/Post";

export function FeedListSkeleton(props: { amount: number }) {
	return (
		<ul>
			{Array(props.amount)
				.fill(null)
				.map((i) => (
					<li className="py-3 px-4" key={i}>
						<PostSkeleton />
					</li>
				))}
		</ul>
	);
}
