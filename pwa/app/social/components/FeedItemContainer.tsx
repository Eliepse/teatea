import { type PropsWithChildren, type ReactNode } from "react";
import clsx from "clsx";
import { extractId } from "~/utils/resource";
import type { Iri } from "~t/types";
import { format, formatDistanceToNow, isAfter, isThisYear, isToday, isYesterday, subDays, subHours } from "date-fns";

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

	if (isAfter(date, subDays(new Date(), 3))) {
		return formatDistanceToNow(date, { includeSeconds: true, addSuffix: true }) + " at " + format(date, "HH:mm");
	}

	if (isThisYear(new Date())) {
		return format(date, "MMM do 'at' HH:mm");
	}

	return format(date, "MMM do, yyyy 'at' HH:mm");
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
	return (
		<article className={clsx("text-stone-800", props.className)}>
			<header className="mb-2 mx-1 text-sm text-stone-600">
				<strong className="font-medium">{extractId(props.author)}</strong>{" "}
				<span className="text-xs text-stone-500">
					{props.action} &middot; {formatPublicationDate(props.publishedAt)}
				</span>
			</header>

			<div className={clsx("border bg-white rounded-xl", props.highlight ? "border-green-200" : "border-stone-200")}>{props.children}</div>
		</article>
	);
}
