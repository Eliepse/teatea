import type { SyntheticEvent } from "react";

/**
 * Empty function that can be called as a safe fallback
 */
export const fn = () => {};

/**
 * Allow calling functions that might be undefined
 */
export function f<T extends Function|undefined>(clb: T) {
	return typeof clb === "function" ? clb : fn;
}

export function warnNotImplemented(): void {
	console.warn("Not implemented!");
}

export function throwNotImplemented(): never {
	throw new Error("Not implemented");
}

export function handleUIEvent(callback?: (e: SyntheticEvent) => void): (e: SyntheticEvent) => void {
	return (e) => {
		e.stopPropagation();
		e.preventDefault();
		return f(callback)(e);
	};
}
