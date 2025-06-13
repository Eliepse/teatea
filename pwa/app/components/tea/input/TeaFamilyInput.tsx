import clsx from "clsx";
import type { ChangeEvent } from "react";

const FAMILIES = {
	white: "White",
	yellow: "Yellow",
	green: "Green",
	wulong: "Wulong",
	black: "Black",
	fermented: "Fermented",
} as const;

type Value = keyof typeof FAMILIES;

export function TeaFamilyInput(props: {
	name?: string;
	defaultValue?: Value | "";
	value?: Value | string;
	onChange?: (value: Value | null) => void;
	required?: boolean;
	className?: string;
}) {
	function handleChange(e: ChangeEvent<HTMLSelectElement>) {
		if (!props.onChange) {
			return;
		}

		e.stopPropagation();
		e.preventDefault();

		const value = e.currentTarget.value;

		if (false === Object.keys(FAMILIES).includes(value)) {
			props.onChange(null);
			return;
		}

		props.onChange(value as Value);
	}

	return (
		<select
			value={props.value}
			name={props.name}
			defaultValue={props.defaultValue}
			className={clsx("select", props.className)}
			onChange={handleChange}
			required={props.required}
		>
			<option value="" disabled>
				Pick a type
			</option>
			{Object.entries(FAMILIES).map(([key, label]) => (
				<option key={key} value={key}>
					{label}
				</option>
			))}
		</select>
	);
}
