import type { PropsWithChildren, ReactNode } from "react";
import clsx from "clsx";
import styles from "./AuthLayout.module.css";
import { CalendarDaysIcon, HomeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Link, useNavigation } from "react-router";
import { EcologyBook, Leaf } from "iconoir-react";
import { useUser } from "~/auth/hooks/useUser";

export function AuthLayout(props: PropsWithChildren<{ className?: string; activeKey?: string }>) {
	const navigation = useNavigation();
	const user = useUser();
	const isNavigating = Boolean(navigation.location);

	return (
		<div className={styles.root}>
			<div className="relative overflow-hidden">
				{isNavigating && (
					<div className="h-full flex items-center justify-center bg-green-50">
						<Leaf className="size-8 animate-spin text-green-700" />
					</div>
				)}

				{false === isNavigating && (
					<div className={clsx("h-full overflow-auto", props.className)}>{props.children}</div>
				)}
			</div>

			<nav className="border-t border-gray-200">
				<ul className="w-full h-full flex px-4">
					<li className="flex-1">
						<Link to="/welcome">
							<NavItem
								icon={<HomeIcon className="size-5" />}
								label="Home"
								active={"home" === props.activeKey}
							/>
						</Link>
					</li>
					<li className="flex-1">
						<Link to={`/members/${user.data?.username}/teas`}>
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
			</nav>
		</div>
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
