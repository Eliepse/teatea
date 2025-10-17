import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useTeaFormContext } from "../../tea/CreateTeaFlow";
import { Check } from "~/components/icons/Check";
import Chevron from "~/components/icons/chevron";
import { teaFamilies } from "~t/types";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import { handleUIEvent } from "~/utils/function";
import { YearInput } from "~/components/shared/inputs/YearInput";
import { RoastField } from "~/components/tea/create/RoastField";

export function TeaFormConfirmation(props: {
	values: ReturnType<typeof useTeaFormContext>["formValue"];
	onChange: (values: ReturnType<typeof useTeaFormContext>["formValue"]) => void;
	onConfirm: () => void;
	onBack: () => void;
}) {
	const ctx = useTeaFormContext();
	const navigationStack = useStackNavigator();
	const isExistingType = props.values.type && "@id" in props.values.type;

	return (
		<PageLayout
			title="Is it all good?"
			onBack={props.onBack}
			action={
				<button
					className="ml-auto btn btn-primary"
					onClick={handleUIEvent(props.onConfirm)}
					disabled={ctx.submitting}
				>
					{ctx.submitting ? "Saving..." : "Submit the tea"}
					<Check className="size-4 ml-1" />
				</button>
			}
		>
			<button
				className="my-4 btn btn-block text-left h-16"
				onClick={handleUIEvent(() => navigationStack.next("origin:select"))}
			>
				<div>
					<div className="text-xs text-base-content/60 mb-1">Origin</div>
					<div>
						{!props.values.origin && "Not set"}
						{props.values.origin?.name}
					</div>
				</div>
				<Chevron direction="right" className="size-4 ml-auto" />
			</button>

			<button
				className="mb-4 btn btn-block text-left h-16"
				onClick={handleUIEvent(() => navigationStack.next("family:select"))}
			>
				<div>
					<div className="text-xs text-base-content/60 mb-1">Type</div>
					<div>{props.values.family ? teaFamilies[props.values.family] : "Not set"}</div>
				</div>
				<Chevron direction="right" className="size-4 ml-auto" />
			</button>

			<button
				className="my-4 btn btn-block text-left h-16"
				onClick={() => navigationStack.next(isExistingType ? "type:select" : "name:ask")}
			>
				<div>
					<div className="text-xs text-base-content/60 mb-1">Type</div>
					<div>{props.values.type ? props.values.type.name : "Not set"}</div>
				</div>
				<Chevron direction="right" className="size-4 ml-auto" />
			</button>

			<fieldset className="fieldset mb-4">
				<legend className="fieldset-legend">Harvest year</legend>
				<YearInput
					value={props.values.year}
					placeholder="Not set"
					onChange={(year) => props.onChange({ ...props.values, year })}
					min={1850}
					allowClear
				/>
			</fieldset>

			<RoastField
				value={props.values.roast}
				onChange={(roast) => props.onChange({ ...props.values, roast })}
				className="mb-4"
			/>
		</PageLayout>
	);
}
