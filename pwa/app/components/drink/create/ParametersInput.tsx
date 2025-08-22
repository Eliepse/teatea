import { useState } from "react";
import { PageLayout } from "~/components/shared/paged/PageLayout";
import { TeaQuantityInput } from "~/components/shared/inputs/TeaQuantityInput";
import { WaterVolumeInput } from "~/components/shared/inputs/WaterVolumeInput";
import { PredefinedNumberInput } from "~/components/shared/inputs/PredefinedNumberInput";
import { handleUIEvent } from "~/utils/function";
import Arrow from "~/components/icons/arrow";

export function ParametersInput(props: {
	onConfirm: (tea: number | undefined, water: number | undefined) => void;
	defaultTea?: number;
	defaultWater?: number;
	onBack?: () => void;
}) {
	const [tea, setTea] = useState(props.defaultTea);
	const [water, setWater] = useState(props.defaultWater);

	function confirm() {
		props.onConfirm(tea, water);
	}

	return (
		<PageLayout
			title="Brewing parameters"
			onBack={props.onBack}
			action={
				<button className="ml-auto btn btn-primary" onClick={handleUIEvent(confirm)}>
					Next
					<Arrow direction="right" className="size-4 ml-1" />
				</button>
			}
		>
			<fieldset className="fieldset mb-6">
				<legend className="fieldset-legend">Tea quantity</legend>
				<TeaQuantityInput value={tea} onChange={setTea} />
			</fieldset>

			<fieldset className="fieldset mb-6">
				<legend className="fieldset-legend">Water volume</legend>
				<WaterVolumeInput value={water} onChange={setWater} />
			</fieldset>
		</PageLayout>
	);
}
