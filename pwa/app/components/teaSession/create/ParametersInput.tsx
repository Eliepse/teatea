import { type ReactNode, useState } from "react";
import { TeaQuantityInput } from "~/components/shared/inputs/TeaQuantityInput";
import { WaterVolumeInput } from "~/components/shared/inputs/WaterVolumeInput";
import clsx from "clsx";
import { FrameActions } from "~/components/teaSession/CreateTeaSessionFlow";

export function ParametersInput(props: {
	onConfirm: (tea: number | undefined, water: number | undefined) => void;
	defaultTea?: number;
	defaultWater?: number;
	onBack?: () => void;
	header?: ReactNode;
	className?: string;
}) {
	const [tea, setTea] = useState(props.defaultTea);
	const [water, setWater] = useState(props.defaultWater);

	function confirm() {
		props.onConfirm(tea, water);
	}

	return (
		<div className={clsx("flex flex-col", props.className)}>
			{props.header}

			<div className="flex-1 p-4">
				<fieldset className="fieldset mb-6">
					<legend className="fieldset-legend text-base text-teal-700">Tea quantity</legend>
					<TeaQuantityInput value={tea} onChange={setTea} />
				</fieldset>

				<fieldset className="fieldset mb-6">
					<legend className="fieldset-legend text-base text-teal-700">Water volume</legend>
					<WaterVolumeInput value={water} onChange={setWater} />
				</fieldset>
			</div>

			<FrameActions onBack={props.onBack} onNext={confirm} className="p-4 flex-none" />
		</div>
	);
}
