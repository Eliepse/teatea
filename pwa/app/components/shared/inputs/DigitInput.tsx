import { type ChangeEvent, type FocusEvent, type Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { clamp } from "~/utils/math";
import { f } from "~/utils/function";

export type DigitInputRef = { focus: () => void; blur: () => void };

function cleanInput(raw: string): string {
	return raw.trim().replaceAll(/\D/g, "");
}

export function DigitInput(props: {
	max: number;
	value: number;
	onChange?: (value: number) => void;
	onBlur?: (value: number) => void;
	onFilled?: (value: number) => void;
	padded?: boolean;
	ref?: Ref<DigitInputRef>;
}) {
	const maxLength = props.max.toFixed().length;
	const input = useRef<HTMLInputElement>(null);
	const [inputText, setInputText] = useState(formatValue(props.value));

	useEffect(() => setInputText(formatValue(props.value)), [props.value]);

	function formatValue(value: number): string {
		if (props.padded) {
			return value.toFixed().padStart(maxLength, "0");
		}

		return value.toFixed();
	}

	function parseValue(raw: string | number): number {
		if (typeof raw === "number") {
			return clamp(0, raw, props.max);
		}

		return clamp(0, raw.length ? parseInt(raw) : 0, props.max);
	}

	function handleBlur(e: FocusEvent<HTMLInputElement>) {
		const value = parseValue(cleanInput(e.currentTarget.value));
		setInputText(formatValue(value));
		f(props.onChange)(value);
		f(props.onBlur)(value);
	}

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		const rawValue = cleanInput(e.currentTarget.value);
		setInputText(rawValue);

		if (maxLength <= rawValue.length) {
			const value = parseValue(rawValue);
			setInputText(formatValue(value));
			f(props.onChange)(value);
			f(props.onFilled)(value);
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
			placeholder={formatValue(0)}
			value={inputText}
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
