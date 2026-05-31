import { Fragment, useState } from "react";
import { Bonfire } from "iconoir-react";
import { TeaSpecButton } from "~/catalog/components/CreateTeaModal/TeaSpecButton";
import { Modal } from "~/components/shared/modal/Modal";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";
import { type RoastLevel, RoastLevelEnum } from "~t/types";
import { RadioButton, RadioButtonGroup } from "~/shared/components/RadioButtonGroup";

const RoastLevelLabel = {
	no: "No",
	yes: "Yes",
	light: "Light",
	mild: "Mild",
	strong: "Strong",
} as const;

export function RoastAction(props: { roast?: RoastLevel; onChange: (roast?: RoastLevel) => void; readonly?: boolean }) {
	const [isSelecting, setIsSelecting] = useState(false);
	const [value, setValue] = useState<RoastLevel | undefined>(props.roast);

	function cancel() {
		setValue(props.roast);
		setIsSelecting(false);
	}

	function confirm() {
		props.onChange("no" === value ? undefined : value);
		setIsSelecting(false);
	}

	return (
		<Fragment>
			<TeaSpecButton
				icon={<Bonfire className="size-4" />}
				label={props.roast ? RoastLevelLabel[props.roast] : "Roast"}
				onClick={() => setIsSelecting(true)}
				filled={!!props.roast}
				readonly={props.readonly}
			/>

			<Modal open={isSelecting} onClose={() => setIsSelecting(false)} className="">
				<div className="flex gap-4 p-4 border-b border-green-200">
					<SecondaryButton className="flex-1" onClick={cancel}>
						Cancel
					</SecondaryButton>
					<PrimaryButton className="flex-2" onClick={confirm}>
						Confirm
					</PrimaryButton>
				</div>

				<div className="px-6 py-10">
					<RadioButtonGroup value={value ?? "no"} onChange={setValue}>
						<RadioButton value={RoastLevelEnum.No}>No</RadioButton>
						<RadioButton value={RoastLevelEnum.Yes}>Yes</RadioButton>
						<RadioButton value={RoastLevelEnum.Light}>Light</RadioButton>
						<RadioButton value={RoastLevelEnum.Mild}>Mild</RadioButton>
						<RadioButton value={RoastLevelEnum.Strong}>Strong</RadioButton>
					</RadioButtonGroup>
				</div>
			</Modal>
		</Fragment>
	);
}
