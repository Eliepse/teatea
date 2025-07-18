export function shuffle<T extends Array<unknown>>(array: T): T {
	let m = array.length,
		t,
		i;

	// While there remain elements to shuffle…
	while (m) {
		// Pick a remaining element…
		i = Math.floor(Math.random() * m--);

		// And swap it with the current element.
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}

	return array;
}

export function unique<T>(array: T[]): T[] {
	return array.reduce((list, item) => (list.includes(item) ? list : [...list, item]), [] as T[]);
}

export function keyBy<T extends object	>(
	array: T[],
	key: keyof T | ((v: T) => string | number),
): {
	[key: string | number]: T;
} {
	const extractor = typeof key !== "function" ? (item: T) => item[key] : key;

	return array.reduce((map, item) => {
		// @ts-ignore (elie) Typing is too hard for me in that kind of helper
		map[extractor(item)] = item;
		return map;
	}, {}) as { [key: string | number]: T };
}
