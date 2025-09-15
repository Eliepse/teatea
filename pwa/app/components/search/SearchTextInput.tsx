import { type ChangeEvent, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";
import { XCircleIcon } from "@heroicons/react/16/solid";

export function SearchTextInput(props: {
	defaultValue?: string | undefined;
	onChange: (value: string | undefined) => void;
	disabled?: boolean;
	debounceDelayMs?: number;
	loading?: boolean;
}) {
	const [value, setValue] = useState(props.defaultValue?.trim() ?? "");
	const previousValue = useRef(value);
	const isFilled = 0 !== value.trim().length;

	function clear() {
		setValue("");
		// Don't wait for debounce
		props.onChange(undefined);
	}

	function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
		setValue(e.currentTarget.value);
	}

	// Prevents too many requests (debounce)
	useEffect(() => {
		if(previousValue.current === value) {
			return;
		}

		previousValue.current = value;

		const timeout = setTimeout(() => {
			const cleanValue = value.trim();
			props.onChange(0 === cleanValue.length ? undefined : cleanValue);
		}, props.debounceDelayMs ?? 350);

		return () => clearTimeout(timeout);
	}, [props.onChange, props.debounceDelayMs, value]);

	return (
		<div className={clsx("input w-full", isFilled && "pr-0")}>
			<MagnifyingGlassIcon className="size-4 text-base-content/40 flex-none" />

			<input placeholder="Search" value={value} onChange={handleInputChange} disabled={props.disabled} />

			{props.loading && (
				<svg className="h-4 w-4 flex-none text-gray-400 animate-spin" viewBox="0 0 16 16">
					<circle
						cx={8}
						cy={8}
						r={6}
						fill="none"
						stroke="currentcolor"
						strokeWidth={2}
						strokeDasharray="27 13"
					/>
				</svg>
			)}

			{isFilled && !props.disabled && (
				<button className="h-full px-4 flex-none" onClick={handleUIEvent(clear)}>
					<XCircleIcon className="size-4 cursor-pointer opacity-60 hover:opacity-100 active:opacity-100" />
				</button>
			)}
		</div>
	);
}
