import { RoastLevelEnum } from "~t/types";

type FineGrainLevel = (typeof RoastLevelEnum)[keyof Omit<typeof RoastLevelEnum, "Yes" | "No">];

export function RoastLevelInput(props: {
	value?: FineGrainLevel;
	onChange: (value: FineGrainLevel) => void;
	disabled?: boolean;
}) {
	return (
		<div className="join flex">
			<input
				className="join-item flex-1 btn"
				type="radio"
				name="roast-toggle"
				aria-label="Unkown"
				disabled={props.disabled}
			/>
			<input
				className="join-item flex-1 btn"
				type="radio"
				name="roast-toggle"
				aria-label="No"
				disabled={props.disabled}
			/>
			<select defaultValue="Pick a color" className="join-item select flex-1">
				<option disabled={true}>Yes</option>
				<option>Not sure</option>
				<option>Low</option>
				<option>Mild</option>
				<option>Strong</option>
			</select>
		</div>
	);
}
