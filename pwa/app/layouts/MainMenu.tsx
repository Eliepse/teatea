import { Link } from "react-router";
import { CalendarDaysIcon, HomeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { EcologyBook } from "iconoir-react";
import type { ReactNode } from "react";
import clsx from "clsx";
import { useToken } from "~/auth/hooks/useToken";

export function MainMenu(props: { activeKey?: string }) {
	const [token] = useToken();

	return (
		<ul className="w-full h-full flex px-4">
			<li className="flex-1">
				<Link to="/welcome">
					<NavItem icon={<HomeIcon className="size-5" />} label="Home" active={"home" === props.activeKey} />
				</Link>
			</li>
			<li className="flex-1">
				<Link to={`/members/${token?.username}/teas`}>
					<NavItem
						icon={<EcologyBook className="size-5" />}
						label="My teas"
						active={"my-teas" === props.activeKey}
					/>
				</Link>
			</li>
			<li className="flex-1">
				<Link to="/tea/search">
					<NavItem
						icon={<MagnifyingGlassIcon className="size-5" />}
						label="Search"
						active={"search" === props.activeKey}
					/>
				</Link>
			</li>
			<li className="flex-1">
				<Link to="/sessions">
					<NavItem
						icon={<CalendarDaysIcon className="size-5" />}
						label="Activity"
						active={"activity" === props.activeKey}
					/>
				</Link>
			</li>
		</ul>
	);
}

function NavItem(props: { icon: ReactNode; label: string; active: boolean }) {
	return (
		<div
			className={clsx(
				"h-full flex flex-col items-center justify-center",
				props.active ? "text-primary" : "text-gray-600",
			)}
		>
			{props.icon}
			<span className="mt-0.5 text-xs">{props.label}</span>
		</div>
	);
}
