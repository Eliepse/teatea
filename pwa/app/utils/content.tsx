import { Fragment, type ReactNode } from "react";

const nlRegex = /\r\n|\r|\n/g;

export function nl2br(text: string): ReactNode[] {
	return text
		.split(nlRegex)
		.reduce((children, line, i) => {
			children.push(<Fragment key={i * 2}>{line}</Fragment>, <br key={i * 2 + 1} />);
			return children;
		}, [] as ReactNode[])
		.slice(0, -1);
}
