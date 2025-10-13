import { DigitInput, type DigitInputRef } from "./DigitInput";
import { useRef } from "react";
import { Duration } from "~/utils/value-objects/units";
import clsx from "clsx";

export function DurationInput(props: { value: Duration; onChange: (value: Duration) => void; className?: string }) {
	// const inputHours = useRef<NumberInputRef>(null);
	const inputMinutes = useRef<DigitInputRef>(null);
	const inputSeconds = useRef<DigitInputRef>(null);

	// function updateHours(value: number) {
	// 	props.onChange(new Duration(value * 3600 + props.value.minutes * 60 + props.value.seconds));
	// }

	function updateMinutes(value: number) {
		props.onChange(new Duration(props.value.hours * 3600 + value * 60 + props.value.seconds));
	}

	function updateSeconds(value: number) {
		props.onChange(new Duration(props.value.hours * 3600 + props.value.minutes * 60 + value));
	}

	return (
		<div className={clsx("text-4xl", props.className)}>
			{/*<NumberInput*/}
			{/*	ref={inputHours}*/}
			{/*	defaultValue={props.value.hours}*/}
			{/*	max={24}*/}
			{/*	onBlur={updateHours}*/}
			{/*	onFilled={() => inputMinutes.current?.focus()}*/}
			{/*	padded*/}
			{/*/>*/}
			{/*<span className="mx-1">:</span>*/}
			<DigitInput
				ref={inputMinutes}
				value={props.value.minutes}
				max={60}
				onBlur={updateMinutes}
				onFilled={() => inputSeconds.current?.focus()}
				padded
			/>
			<span className="mx-1">:</span>
			<DigitInput
				ref={inputSeconds}
				value={props.value.seconds}
				max={60}
				onBlur={updateSeconds}
				onFilled={() => inputSeconds.current?.blur()}
				padded
			/>
		</div>
	);
}
