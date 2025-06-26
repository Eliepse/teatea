import { useState } from "react";

function store(key: string, data: unknown) {
	window.localStorage.setItem(key, JSON.stringify(data));
}

function get<T extends unknown>(key: string): T | null {
	const raw = window.localStorage.getItem(key);
	return null === raw ? null : JSON.parse(raw);
}

function remove(key: string) {
	window.localStorage.removeItem(key);
}

export function useLocalStorage<T>(key: string, defaultValue: T | null = null): [T | null, (value: T | null) => void, () => void] {
	const [value, setValue] = useState<T | null>(() => {
		try {
			const value = get<T>(key);

			if (null === value) {
				store(key, defaultValue);
				return defaultValue;
			}

			return value;
		} catch (err) {
			console.error(err);
			return defaultValue;
		}
	});

	function clear() {
		remove(key);
		setValue(defaultValue);
	}

	function set(value: T | null) {
		if (null === value) {
			clear();
			return;
		}

		try {
			store(key, value);
		} catch (err) {
			console.error(err);
		}

		setValue(value);
	}

	return [value, set, clear];
}

export const LocalStorageUtils = { store, get, remove };
