import type { PropsWithChildren } from "react";
import { useToken } from "~/auth/hooks/useToken";

export function IfVisitor(props: PropsWithChildren) {
	const [token] = useToken();
	return null === token ? props.children : null;
}
