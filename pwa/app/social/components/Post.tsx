import type { MediaObject, Member } from "~t/types";
import { PostImagesCarousel } from "~/social/components/PostImagesCarousel";
import clsx from "clsx";
import { useState } from "react";

export function Post(props: {
	author: Pick<Member, "username">;
	content: string;
	createdAt: Date;
	images: MediaObject[];
}) {
	const shouldTruncate = 140 < props.content.length;
	const [truncated, setTruncated] = useState(shouldTruncate);

	return (
		<div className="rounded-xl overflow-hidden">
			{!!props.images.length && <PostImagesCarousel images={props.images} />}

			<div className={clsx("py-3")}>
				<p className="px-4">
					{truncated ? props.content.slice(0, 140) + "..." : props.content}

					{shouldTruncate && (
						<button
							onClick={() => setTruncated((v) => !v)}
							className={clsx(
								"text-sm text-green-800/60 cursor-pointer",
								truncated ? "inline-block ml-2" : "block mt-2",
							)}
						>
							{truncated ? "Show more" : "Show less"}
						</button>
					)}
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
