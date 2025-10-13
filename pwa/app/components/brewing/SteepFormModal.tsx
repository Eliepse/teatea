import { useState } from "react";
import { Duration, Temperature } from "~/utils/value-objects/units";
import { handleUIEvent } from "~/utils/function";
import { ClockIcon } from "@heroicons/react/24/outline";
import { FireFlame } from "iconoir-react";
import { Modal } from "~/components/shared/modal/Modal";
import { DurationInput } from "~/components/shared/inputs/DurationInput";
import { DigitInput } from "~/components/shared/inputs/DigitInput";

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
						<DigitInput
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
