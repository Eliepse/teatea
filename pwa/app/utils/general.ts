export function safeEmpty<T, F>(value: T, fallback?: T): T | undefined {
	if (Array.isArray(value)) {
		return 0 !== value.length ? value : fallback;
	}

	return value ? value : fallback;
}
