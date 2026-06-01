import type { PropsWithChildren } from "react";

export function If(props: PropsWithChildren<{ check: boolean | string | number | undefined | object }>) {
	return props.check ? props.children : null;
}
