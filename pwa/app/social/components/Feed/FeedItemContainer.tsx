import { type PropsWithChildren, type ReactNode } from "react";
import clsx from "clsx";
import { extractId } from "~/utils/resource";
import type { Iri } from "~t/types";
import { format, formatDistanceToNow, isAfter, isThisYear, isToday, isYesterday, subDays, subHours } from "date-fns";
import { Link } from "react-router";
import { ChatBubble, Heart, MessageText } from "iconoir-react";
import { Comment } from "postcss";

function formatPublicationDate(date: Date): string {
	if (isAfter(date, subHours(new Date(), 6))) {
		return formatDistanceToNow(date, { includeSeconds: true, addSuffix: true });
	}

	if (isToday(date)) {
		return format(date, "'today at' HH:mm");
	}

	if (isYesterday(date)) {
		return format(date, "'yesterday at' HH:mm");
	}

	if (isAfter(date, subDays(new Date(), 6))) {
		return formatDistanceToNow(date, { includeSeconds: true, addSuffix: true }) + " at " + format(date, "HH:mm");
	}

	if (isThisYear(new Date())) {
		return format(date, "eee. MMM do 'at' HH:mm");
	}

	return format(date, "yyyy-MM-dd 'at' HH:mm");
}

export function FeedItemContainer(
	props: PropsWithChildren<{
		id: number;
		author: Iri;
		action?: ReactNode;
		publishedAt: Date;
		highlight?: boolean;
		className?: string;
	}>,
) {
	const username = extractId(props.author);
	return (
		<article className={clsx("text-stone-800 bg-white rounded-lg border border-stone-200", props.className)}>
			<div>{props.children}</div>

			<footer className="pl-4 pr-2 text-sm text-stone-600 border-t border-stone-100 flex items-center">
				<Link to={`/members/${username}`}>
					<cite className="font-normal not-italic">{username}</cite>{" "}
				</Link>

				<button className="ml-auto p-2 inline-flex items-center gap-1">
					<Heart className="size-4 inline-block mr-0" /> <span className="text-xs">{Math.round(Math.random() * 42)}</span>
				</button>

				<button className="ml-0 p-2">
					<MessageText className="size-4" />
				</button>
			</footer>
		</article>
	);
}
