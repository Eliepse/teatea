import { type ChangeEvent, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";
import { XmarkCircle } from "iconoir-react";
import styles from "./SearchTextInput.module.css";

export function SearchTextInput(props: {
	defaultValue?: string | undefined;
	onChange: (value: string | undefined) => void;
	disabled?: boolean;
	debounceDelayMs?: number;
}) {
	const { onChange, debounceDelayMs } = props;
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
		if (previousValue.current === value) {
			return;
		}

		previousValue.current = value;

		const timeout = setTimeout(() => {
			const cleanValue = value.trim();
			onChange(0 === cleanValue.length ? undefined : cleanValue);
		}, debounceDelayMs ?? 350);

		return () => clearTimeout(timeout);
	}, [onChange, debounceDelayMs, value]);

	return (
		<div className={clsx(styles.root)}>
			<MagnifyingGlassIcon className={styles.prefixIcon} width={20} height={20} />

			<input
				className={styles.input}
				placeholder="Search"
				value={value}
				onChange={handleInputChange}
				disabled={props.disabled}
			/>

			{isFilled && !props.disabled && (
				<button
					className="px-4 flex-none cursor-pointer opacity-60 hover:opacity-100 active:opacity-100"
					onClick={handleUIEvent(clear)}
				>
					<XmarkCircle className="size-5" />
				</button>
			)}
		</div>
	);
}
