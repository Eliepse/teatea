import { formatISO } from "date-fns";

/**
 * Create a promise that waits the given amount of ms before resolving
 */
export function wait(durationMs: number) {
	return new Promise((r) => setTimeout(r, durationMs));
}

/**
 * Makes a date serializable with JSON, including the timezone.
 * By default, JSON serialization doesn't keep the timezone
 */
export function jsonableDate(date?: Date | null) {
	if(!date) {
		return date;
	}

	return { ...date, toJSON: () => formatISO(date) };
}
