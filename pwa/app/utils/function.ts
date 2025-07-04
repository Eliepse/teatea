import type { SyntheticEvent } from "react";

export function warnNotImplemented(): void {
	console.warn("Not implemented!");
}

export function throwNotImplemented(): never {
	throw new Error("Not implemented");
}

export function handleUIEvent(callback: (e: SyntheticEvent) => void): (e: SyntheticEvent) => void {
	return (e) => {
		e.stopPropagation();
		e.preventDefault();
		return callback(e);
	};
}
