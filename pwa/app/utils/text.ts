export function limit(text: string, length: number, suffix = "..."): string {
	if(text.length <= length) {
		return text;
	}

	return text.slice(0, length - suffix.length) + suffix;
}
