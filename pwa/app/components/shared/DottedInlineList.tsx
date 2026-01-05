import { Children, type PropsWithChildren, type ReactNode } from "react";

export function DottedInlineList(props: PropsWithChildren<{ dotClassName?: string }>) {
	const children = Children.toArray(props.children);
	const lastIndex = children.length - 1;
	const dottedList: ReactNode[] = [];

	children.forEach((child, i) => {
		dottedList.push(child);

		if (lastIndex !== i) {
			dottedList.push(
				<span key={`${i}dot`} className={props.dotClassName}>
					&middot;
				</span>,
			);
		}
	});

	return dottedList;
}
