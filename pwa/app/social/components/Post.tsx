import type { MediaObject, Member } from "~t/types";
import { formatDate } from "date-fns";

export function Post(props: {
	author: Pick<Member, "username">;
	content: string;
	createdAt: Date;
	images: MediaObject[];
}) {
	return (
		<article className="bg-white rounded-lg shadow-xs overflow-hidden">
			{!!props.images.length && (
				<div className="flex flex-nowrap align-top justify-start overflow-y-auto snap-mandatory snap-x mb-4">
					{props.images.map((img) => (
						<div key={img.id} className="snap-start shrink-0 w-90">
							<img
								src={img.contentUrl}
								style={{ backgroundImage: `url(data:image/webp;base64,${img.placeholder})` }}
								className="w-full h-full min-h-48 max-h-96 object-cover bg-center bg-cover z-0"
								alt=""
							/>
						</div>
					))}
				</div>
			)}

			<div className="py-Y">
				<p className="px-4 leading-tight">{props.content}</p>
			</div>

			<footer className="p-4 pb-2 text-xs flex justify-between text-stone-600">
				<span className="font-medium">@{props.author.username}</span>
				<span className="text-stone-400">{formatDate(props.createdAt, "HH:mm")}</span>
			</footer>
		</article>
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
