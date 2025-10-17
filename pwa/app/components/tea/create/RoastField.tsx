import { type RoastLevel } from "~t/types";
import clsx from "clsx";
import type { ChangeEvent } from "react";

export function RoastField(props: {
	value: RoastLevel | undefined;
	onChange: (value: RoastLevel | undefined) => void;
	className?: string;
}) {
	const truthy = undefined !== props.value && "no" !== props.value;

	function handleLevelSelect(e: ChangeEvent<HTMLSelectElement>) {
		props.onChange(e.currentTarget.value as "light" | "mild" | "strong" | "yes");
	}

	return (
		<div className={props.className}>
			<fieldset className="fieldset mb-4">
				<legend className="fieldset-legend">Is it roasted?</legend>
				<div className="join flex">
					<button
						className={clsx("join-item flex-1 btn h-12", undefined === props.value && "btn-primary")}
						onClick={() => props.onChange(undefined)}
					>
						I don't know
					</button>
					<button
						className={clsx("join-item flex-1 btn h-12", "no" === props.value && "btn-primary")}
						onClick={() => props.onChange("no")}
					>
						No
					</button>
					<button
						className={clsx("join-item flex-1 btn h-12", truthy && "btn-primary")}
						onClick={() => !truthy && props.onChange("yes")}
					>
						Yes
					</button>
				</div>
			</fieldset>

			<fieldset className="fieldset">
				<legend className="fieldset-legend">How much is it roasted?</legend>
				<select
					defaultValue="yes"
					className="select select-lg w-auto"
					disabled={!truthy}
					value={props.value}
					onChange={handleLevelSelect}
				>
					<option value="yes">Can't tell</option>
					<option value="light">Light roast</option>
					<option value="mild">Mild roast</option>
					<option value="strong">Strong roast</option>
				</select>
			</fieldset>
		</div>
	);
}
