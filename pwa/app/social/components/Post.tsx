import type { Member } from "~t/types";
import { formatDate } from "date-fns";

export function Post(props: { author: Pick<Member, "username">; content: string; createdAt: Date }) {
	return (
		<article className="bg-white rounded-lg shadow-xs">
			<div className="p-4 text-xs flex justify-between">
				<span className="font-medium">@{props.author.username}</span>
				<span className="text-stone-600">{formatDate(props.createdAt, "HH:mm")}</span>
			</div>
			<div>
				<p className="px-4 pb-4">{props.content}</p>
			</div>
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
