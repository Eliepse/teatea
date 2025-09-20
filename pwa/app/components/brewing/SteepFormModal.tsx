import { type ChangeEvent, type FocusEvent, type Ref, useImperativeHandle, useRef, useState } from "react";
import { Duration, Temperature } from "~/utils/value-objects/units";
import { handleUIEvent } from "~/utils/function";
import { ClockIcon } from "@heroicons/react/24/outline";
import { FireFlame } from "iconoir-react";
import { Modal } from "~/components/shared/modal/Modal";
import clsx from "clsx";

export type SteepValues = { duration: Duration; temperature: Temperature | null };

export function SteepFormModal(props: {
	open: boolean;
	onClose: () => void;
	defaultValue?: Partial<SteepValues>;
	onSubmit?: (values: SteepValues) => Promise<void>;
	onRemove?: () => Promise<void>;
}) {
	const [loading, setLoading] = useState<"save" | "delete">();
	const [values, setValues] = useState<SteepValues>({
		duration: new Duration(0),
		temperature: null,
		...props.defaultValue,
	});

	function submitForm() {
		if (0 === values.duration.totalSeconds) {
			return;
		}

		if (!props.onSubmit) {
			return;
		}

		setLoading("save");
		const temperature = 0 === values.temperature?.deg ? null : values.temperature;
		props.onSubmit({ ...values, temperature }).finally(() => setLoading(undefined));
	}

	function remove() {
		if (!props.onRemove) {
			return;
		}

		setLoading("delete");
		props.onRemove().finally(() => setLoading(undefined));
	}

	return (
		<Modal onClose={props.onClose} open={props.open} className="h-full flex flex-col" position="bottom" backdrop>
			<div className="flex justify-between">
				<button
					className="btn btn-outline"
					onClick={handleUIEvent(props.onClose)}
					disabled={undefined !== loading}
				>
					Cancel
				</button>

				<button className="btn btn-primary" onClick={handleUIEvent(submitForm)} disabled={"save" === loading}>
					{"save" === loading ? "Saving..." : "Done"}
				</button>
			</div>

			<div className="flex-1 mt-12 flex flex-col">
				<div className="flex justify-between items-center pr-2">
					<div className="mr-auto">
						<ClockIcon className="size-5 inline-block relative bottom-0.5 mr-2" />
						<span>Duration</span>
					</div>
					<DurationInput
						value={values.duration}
						onChange={(duration) => setValues((s) => ({ ...s, duration: duration }))}
					/>
				</div>

				<div className="flex items-center justify-between my-12">
					<div>
						<FireFlame className="size-5 text-orange-500 relative bottom-0.5 inline-block mr-2" />
						Temperature
					</div>
					<div className="text-4xl">
						<NumberInput
							defaultValue={values.temperature?.deg ?? 0}
							max={100}
							onBlur={(v) => setValues((s) => ({ ...s, temperature: new Temperature(v) }))}
						/>
						<span className="text-xl ml-1">°C</span>
					</div>
				</div>

				{props.onRemove && (
					<button
						className="btn btn-outline btn-block btn-error mt-auto"
						onClick={handleUIEvent(remove)}
						disabled={"delete" === loading}
					>
						{"delete" === loading ? "Deleting..." : "Remove this steep"}
					</button>
				)}
			</div>
		</Modal>
	);
}

function DurationInput(props: { value: Duration; onChange: (value: Duration) => void; className?: string }) {
	// const inputHours = useRef<NumberInputRef>(null);
	const inputMinutes = useRef<NumberInputRef>(null);
	const inputSeconds = useRef<NumberInputRef>(null);

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
			<NumberInput
				ref={inputMinutes}
				defaultValue={props.value.minutes}
				max={60}
				onBlur={updateMinutes}
				onFilled={() => inputSeconds.current?.focus()}
				padded
			/>
			<span className="mx-1">:</span>
			<NumberInput
				ref={inputSeconds}
				defaultValue={props.value.seconds}
				max={60}
				onBlur={updateSeconds}
				onFilled={() => inputSeconds.current?.blur()}
				padded
			/>
		</div>
	);
}

type NumberInputRef = { focus: () => void; blur: () => void };

function NumberInput(props: {
	max: number;
	defaultValue: number;
	onBlur: (value: number) => void;
	onFilled?: (value: number) => void;
	padded?: boolean;
	ref?: Ref<NumberInputRef>;
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
			pattern="\d*"
			maxLength={maxLength}
			onFocus={(e) => e.target.select()}
			onBlur={handleBlur}
			size={maxLength}
		/>
	);
}
