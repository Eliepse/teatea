import { Link } from "react-router";
import type { PropsWithChildren } from "react";
import clsx from "clsx";
import { Heart } from "iconoir-react";

export function TeaLists() {
	return (
		<ul className="grid grid-cols-1 gap-4 text-green-900">
			<li>
				<ListButton list="favorites">
					Favorites <Heart />
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
				"flex bg-white p-6 h-16 items-center justify-between rounded-xl text-lg shadow-sm",
				props.className,
			)}
		>
			{props.children}
		</Link>
	);
}
