import type { PropsWithChildren } from "react";
import { useToken } from "~/auth/hooks/useToken";

export function IfAuthenticated(props: PropsWithChildren) {
	const [token] = useToken();
	return null === token ? null : props.children;
}
