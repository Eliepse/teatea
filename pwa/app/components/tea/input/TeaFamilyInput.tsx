import clsx from "clsx";
import type { ChangeEvent } from "react";
import { teaFamilies, type TeaFamily } from "~t/types";

type Value = TeaFamily;

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

		if (false === Object.hasOwn(teaFamilies, value)) {
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
			<option value="" disabled className="text-base-content/60">
				Pick a family
			</option>
			{Object.entries(teaFamilies).map(([key, label]) => (
				<option key={key} value={key}>
					{label}
				</option>
			))}
		</select>
	);
}
