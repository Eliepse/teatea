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

export function unique<T extends Array<unknown>>(array: T): T {
	return array.reduce((list, item) => (list.includes(item) ? list : [...list, item]), []);
}
