import { type ChangeEvent, type FocusEvent, type Ref, useImperativeHandle, useRef, useState } from "react";

export type DigitInputRef = { focus: () => void; blur: () => void };

export function DigitInput(props: {
	max: number;
	defaultValue: number;
	onBlur: (value: number) => void;
	onFilled?: (value: number) => void;
	padded?: boolean;
	ref?: Ref<DigitInputRef>;
}) {
	const input = useRef<HTMLInputElement>(null);
	const maxLength = props.max.toString().length;
	const [value, setValue] = useState(formatValue(props.defaultValue));

	function formatValue(value: number): string {
		return true === props.padded ? value.toString().padStart(maxLength, "0") : value.toString();
	}

	function clampValue(value: number): number {
		return Math.max(0, Math.min(props.max, value));
	}

	function parseValue(raw: string): number {
		const cleaned = raw.trim().replaceAll(/\D/g, "");
		return clampValue(cleaned.length ? parseInt(cleaned) : 0);
	}

	function handleBlur(e: FocusEvent<HTMLInputElement>) {
		const value = parseValue(e.currentTarget.value);
		setValue(formatValue(value));
		props.onBlur(value);
	}

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		const rawValue = e.target.value;
		setValue(rawValue);

		if (maxLength <= rawValue.length) {
			const value = parseValue(e.currentTarget.value);
			setValue(formatValue(value));
			props.onFilled && props.onFilled(value);
			return;
		}
	}

	useImperativeHandle(
		props.ref,
		() => ({
			focus: () => input.current?.focus(),
			blur: () => input.current?.blur(),
		}),
		[input],
	);

	return (
		<input
			ref={input}
			className="min-w-12 px-1 text-center text-base-content bg-stone-100 rounded-md font-mono"
			placeholder={props.defaultValue.toString().padStart(2, "0")}
			value={value}
			onChange={handleChange}
			pattern="\d+"
			inputMode="numeric"
			maxLength={maxLength}
			onFocus={(e) => e.target.select()}
			onBlur={handleBlur}
			size={maxLength}
		/>
	);
}
