import { RefreshDouble } from "iconoir-react";
import clsx from "clsx";

export function Spinner(props: { className?: string }) {
	return <RefreshDouble className={clsx("animate-spin", props.className)} />;
}
