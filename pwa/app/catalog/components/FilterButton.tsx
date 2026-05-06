import { type PropsWithChildren, Suspense } from "react";
import styles from "./FilterButton.module.css";
import clsx from "clsx";
import { handleUIEvent } from "~/utils/function";
import { Filter, Xmark } from "iconoir-react";

export function FilterButton(props: PropsWithChildren<{ onClick: () => void; active?: boolean; noIcon?: boolean }>) {
	return (
		<button className={clsx(styles.root, props.active && styles.active)} onClick={handleUIEvent(props.onClick)}>
			<Suspense fallback={<span className="skeleton w-16 h-4" />}>{props.children}</Suspense>

			{true !== props.noIcon && props.active && <Xmark className="ml-1.5 mt-[2px] size-4" />}
			{true !== props.noIcon && !props.active && <Filter className="ml-1.5 mt-[2px] size-4" />}
		</button>
	);
}
