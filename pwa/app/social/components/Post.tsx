import type { MediaObject, Member } from "~t/types";
import { formatDate } from "date-fns";
import { PostImagesCarousel } from "~/social/components/PostImagesCarousel";

export function Post(props: {
	author: Pick<Member, "username">;
	content: string;
	createdAt: Date;
	images: MediaObject[];
}) {
	return (
		<div className="rounded-xl overflow-hidden">
			{!!props.images.length && <PostImagesCarousel images={props.images} />}

			<div className="py-3">
				<p className="px-4">
					{props.content}
				</p>
			</div>
		</div>
	);
}

export function PostSkeleton() {
	return (
		<div className="bg-white rounded-lg">
			<div className="p-4 text-xs flex justify-between">
				<span className="w-16 h-3 animate-pulse bg-stone-200 rounded-lg" />
				<span className="w-6 h-3 animate-pulse bg-stone-200 rounded-lg" />
			</div>
			<div className="px-4 pb-4">
				<div className="h-4 animate-pulse bg-stone-200 rounded-lg mb-2" />
				<div className="h-4 animate-pulse bg-stone-200 rounded-lg mb-2" />
				<div className="w-40 h-4 animate-pulse bg-stone-200 rounded-lg mb-2" />
			</div>
		</div>
	);
}
