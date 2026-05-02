import type { PropsWithChildren } from "react";
import clsx from "clsx";
import { useNavigation } from "react-router";
import { Leaf } from "iconoir-react";
import { IfAuthenticated } from "~/auth/components/voters/IfAuthenticated";
import { useToken } from "~/auth/hooks/useToken";
import { MainMenu } from "~/layouts/MainMenu";

export function WithMainMenu(props: PropsWithChildren<{ className?: string; activeKey?: string }>) {
	const navigation = useNavigation();
	const isNavigating = Boolean(navigation.location);
	const [token] = useToken();

	return (
		<>
			<IfAuthenticated>
				<nav className="fixed bottom-0 left-0 right-0 h-16  bg-white border-t border-gray-200">
					<MainMenu />
				</nav>
			</IfAuthenticated>

			{isNavigating && (
				<div className="fixed inset-0 h-full flex items-center justify-center bg-green-50">
					<Leaf className="size-8 animate-spin text-green-700" />
				</div>
			)}

			{!isNavigating && (
				<div className={clsx("min-h-svh overflow-auto bg-green-50 pb-16", props.className)}>
					{props.children}
				</div>
			)}
		</>
	);
}
