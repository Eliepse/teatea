import type { PropsWithChildren, ReactNode } from "react";
import clsx from "clsx";
import styles from "./AuthLayout.module.css";
import { CalendarDaysIcon, HomeIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router";

export function AuthLayout(props: PropsWithChildren<{ className?: string; activeKey?: string }>) {
	return (
		<div className={styles.root}>
			<div className={clsx(styles.body, props.className)}>{props.children}</div>
			<nav className="border-t border-gray-100">
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
						<Link to="/me/drinks">
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
