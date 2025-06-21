export function wait(durationMs: number) {
	return new Promise((r) => setTimeout(r, durationMs));
}
