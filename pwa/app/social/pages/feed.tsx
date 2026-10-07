import { WithMainMenu } from "~/layouts/WithMainMenu";
import { FeedPostInput } from "~/social/components/FeedPostInput";
import { FeedStream } from "~/social/components/FeedStream";

export async function clientLoader() {}

export default function FeedPage() {
	return (
		<WithMainMenu activeKey="feed" className="py-4">
			<FeedPostInput className="mx-4 mb-8" />
			<FeedStream />
		</WithMainMenu>
	);
}
