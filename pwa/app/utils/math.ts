export function clamp(min: number, value: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

export function parseIntSafe(value: number|string|undefined): number|undefined {
	return typeof value === "string" ? parseInt(value) : value;
}
