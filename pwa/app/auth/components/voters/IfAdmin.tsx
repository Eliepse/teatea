import type { PropsWithChildren } from "react";
import { WithRole } from "~/auth/components/voters/WithRole";

export function IfAdmin(props: PropsWithChildren) {
	return <WithRole any="ROLE_ADMIN">{props.children}</WithRole>;
}
