export function warnNotImplemented(): void {
	console.warn("Not implemented!");
}

export function throwNotImplemented(): never {
	throw new Error("Not implemented");
}
