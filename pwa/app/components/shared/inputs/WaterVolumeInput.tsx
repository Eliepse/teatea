import { type ChangeEvent, useState } from "react";
import clsx from "clsx";

const PREDEFINED_VALUES: number[] = [100, 120];

export function WaterVolumeInput(props: { value: number | null; onChange: (value: number | null) => void }) {
	const [isCustom, setIsCustom] = useState(null !== props.value && PREDEFINED_VALUES.includes(props.value));

	function handleCustomChange(e: ChangeEvent<HTMLInputElement>) {
		const value = Math.max(parseInt(e.currentTarget.value.trim()), 0);
		props.onChange(0 !== value ? value : null);
	}

	function handlePredefinedChange(predefinedValue: number) {
		return (e: ChangeEvent<HTMLInputElement>) => {
			e.stopPropagation();

			if (e.currentTarget.checked) {
				props.onChange(predefinedValue);
			}
		};
	}

	if (isCustom) {
		return (
			<label className="input w-full">
				<input type="number" min={10} step={10} value={props.value ?? ""} onChange={handleCustomChange} />
				<span className="label">ml</span>
			</label>
		);
	}

	return (
		<div className="join">
			{PREDEFINED_VALUES.map((val) => (
				<input
					className={clsx("join-item btn flex-1", val === props.value && "btn-primary")}
					type="radio"
					name="predefined"
					aria-label={`${val} ml`}
					onChange={handlePredefinedChange(val)}
					checked={val === props.value}
				/>
			))}

			<button className="join-item btn" onClick={() => setIsCustom(true)}>
				Custom
			</button>
		</div>
	);
}
