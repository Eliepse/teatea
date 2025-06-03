export function clamp(min: number, value: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}
