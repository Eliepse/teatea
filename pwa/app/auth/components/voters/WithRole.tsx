import type { PropsWithChildren } from "react";
import { useUser } from "~/auth/hooks/useUser";

type Voters = { any: string } | { oneOf: string[] };

export function WithRole(props: PropsWithChildren<Voters>) {
	const user = useUser();
	const roles = user.data?.roles ?? [];

	if ("any" in props && roles.includes(props.any)) {
		return props.children;
	}

	if ("oneOf" in props && undefined !== roles.find((role) => props.oneOf.includes(role))) {
		return props.children;
	}

	return null;
}
