import { type ChangeEvent, type ReactNode } from "react";
import clsx from "clsx";
import { f, handleUIEvent } from "~/utils/function";
import { XmarkCircle } from "iconoir-react";
import styles from "./TextInput.module.css";

export function TextInput(props: {
	value?: string;
	prefixIcon?: ReactNode;
	onChange?: (value: string | undefined) => void;
	placeholder?: string;
	disabled?: boolean;
	allowClear?: boolean;
}) {
	const isFilled = 0 !== props.value?.trim()?.length;

	function clear() {
		f(props.onChange)(undefined);
	}

	function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
		const rawValue = e.target.value;
		const cleanValue = rawValue.trim();
		f(props.onChange)(cleanValue.length ? rawValue : undefined);
	}

	return (
		<div className={clsx(styles.root)}>
			<input
				className={styles.input}
				placeholder={props.placeholder}
				value={props.value ?? ""}
				onChange={handleInputChange}
				disabled={props.disabled}
			/>

			{isFilled && props.allowClear && !props.disabled && (
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
