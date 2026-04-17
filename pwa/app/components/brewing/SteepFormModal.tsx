import { type PropsWithChildren, useState } from "react";
import { Duration, Temperature } from "~/utils/value-objects/units";
import { handleUIEvent } from "~/utils/function";
import { ClockIcon } from "@heroicons/react/24/outline";
import { FireFlame } from "iconoir-react";
import { Modal } from "~/components/shared/modal/Modal";
import { DurationInput } from "~/components/shared/inputs/DurationInput";
import { DigitInput } from "~/components/shared/inputs/DigitInput";
import { clamp } from "~/utils/math";
import type { Steep } from "~t/types";

export function SteepFormModal(props: {
	open: boolean;
	onClose: () => void;
	defaultValue?: Partial<Steep>;
	onSubmit?: (values: Steep) => Promise<void>;
	onRemove?: () => Promise<void>;
}) {
	const [loading, setLoading] = useState<"save" | "delete">();
	const [values, setValues] = useState<Steep>({
		duration: new Duration(0),
		temperature: undefined,
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
		const temperature = 0 === values.temperature?.deg ? undefined : values.temperature;
		props.onSubmit({ ...values, temperature }).finally(() => setLoading(undefined));
	}

	function remove() {
		if (!props.onRemove) {
			return;
		}

		setLoading("delete");
		props.onRemove().finally(() => setLoading(undefined));
	}

	function setDuration(seconds: number) {
		setValues((v) => ({ ...v, duration: new Duration(seconds) }));
	}

	function offsetDuration(delta: number) {
		setValues((v) => ({ ...v, duration: new Duration(Math.max(0, (v.duration?.totalSeconds ?? 0) + delta)) }));
	}

	function setTemperature(degrees: number) {
		setValues((v) => ({ ...v, temperature: new Temperature(clamp(0, degrees, 100)) }));
	}

	function offsetTemperature(delta: number) {
		setValues((v) => ({ ...v, temperature: new Temperature(clamp(0, (v.temperature?.deg ?? 0) + delta, 100)) }));
	}

	return (
		<Modal onClose={props.onClose} open={props.open} className="flex flex-col p-4">
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
				<div className="flex justify-between items-center pr-2 mb-4">
					<div className="mr-auto">
						<ClockIcon className="size-5 inline-block relative bottom-0.5 mr-2" />
						<span>Duration</span>
					</div>
					<DurationInput
						value={values.duration}
						onChange={(duration) => setValues((s) => ({ ...s, duration: duration }))}
					/>
				</div>

				<div className="flex items-center justify-end gap-3 mb-12">
					{!values.duration?.totalSeconds ? (
						<>
							<QuickAction onClick={() => setDuration(30)}>00:30</QuickAction>
							<QuickAction onClick={() => setDuration(60)}>01:00</QuickAction>
							<QuickAction onClick={() => setDuration(120)}>02:00</QuickAction>
						</>
					) : (
						<>
							<QuickAction
								disabled={values.duration.totalSeconds <= 0}
								onClick={() => offsetDuration(-30)}
							>
								-30
							</QuickAction>
							<QuickAction
								disabled={values.duration.totalSeconds <= 0}
								onClick={() => offsetDuration(-5)}
							>
								-5
							</QuickAction>
							<QuickAction onClick={() => offsetDuration(5)}>+5</QuickAction>
							<QuickAction onClick={() => offsetDuration(30)}>+30</QuickAction>
						</>
					)}
				</div>

				<div className="flex items-center justify-between mb-4">
					<div>
						<FireFlame className="size-5 text-orange-500 relative bottom-0.5 inline-block mr-2" />
						Temperature
					</div>
					<div className="text-4xl">
						<DigitInput
							max={100}
							value={values.temperature?.deg ?? 0}
							onChange={(v) => setValues((s) => ({ ...s, temperature: new Temperature(v) }))}
						/>
						<span className="text-xl ml-1">°C</span>
					</div>
				</div>

				<div className="flex items-center justify-end gap-3 mb-12">
					{!values.temperature?.deg ? (
						<>
							<QuickAction onClick={() => setTemperature(70)}>70</QuickAction>
							<QuickAction onClick={() => setTemperature(80)}>80</QuickAction>
							<QuickAction onClick={() => setTemperature(90)}>90</QuickAction>
							<QuickAction onClick={() => setTemperature(100)}>100</QuickAction>
						</>
					) : (
						<>
							<QuickAction disabled={values.temperature.deg <= 0} onClick={() => offsetTemperature(-5)}>
								-5
							</QuickAction>
							<QuickAction disabled={values.temperature.deg >= 100} onClick={() => offsetTemperature(5)}>
								+5
							</QuickAction>
						</>
					)}
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

function QuickAction(props: PropsWithChildren<{ onClick: () => void; disabled?: boolean }>) {
	return (
		<button
			className="btn btn-soft btn-secondary btn-circle w-12"
			onClick={handleUIEvent(props.onClick)}
			disabled={true === props.disabled}
		>
			{props.children}
		</button>
	);
}
