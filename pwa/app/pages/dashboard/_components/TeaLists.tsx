import { Link } from "react-router";
import type { PropsWithChildren } from "react";
import clsx from "clsx";
import { Heart, Star } from "iconoir-react";

export function TeaLists(props: {}) {
	return (
		<ul className="grid grid-cols-2 gap-4">
			<li>
				<ListButton list="favorites">
					Favorites <Heart />
				</ListButton>
			</li>
			<li>
				<ListButton list="wishlist">
					Wishlist <Star />
				</ListButton>
			</li>
		</ul>
	);
}

function ListButton(props: PropsWithChildren<{ list: string; className?: string }>) {
	return (
		<Link
			to={`/lists/${props.list}`}
			className={clsx(
				"flex bg-primary/10 p-6 h-20 mt-4 items-center justify-between rounded-md text-lg text-primary",
				props.className,
			)}
		>
			{props.children}
		</Link>
	);
}
