import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useTeaFormContext } from "./AddTeaForm";
import { Check } from "~/components/icons/Check";
import Chevron from "~/components/icons/chevron";
import { useOriginByPath } from "~/utils/api/useOrigins";
import { teaFamilies } from "~t/types";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";

export function OtherTeaInfo() {
	const context = useTeaFormContext();
	const navigationStack = useStackNavigator();
	const origins = useOriginByPath();
	const values = context.formValue;

	function handleSubmit() {
		void context.submit();
	}

	return (
		<PageLayout
			title="What else do you know about it?"
			onBack={context.submitting ? false : navigationStack.back}
			action={
				<div className="flex justify-center">
					<button
						className="ml-2 btn btn-primary rounded-full"
						onClick={handleSubmit}
						disabled={context.submitting}
					>
						{context.submitting ? "Saving..." : "Add new tea"}
						{!context.submitting && <Check className="size-4 ml-1" />}
					</button>
				</div>
			}
		>
			<button className="mb-4 btn btn-block text-left h-16" onClick={() => navigationStack.next({ key: "type" })}>
				<div>
					<div className="text-xs text-base-content/60 mb-1">Type</div>
					<div>{values.family ? teaFamilies[values.family] : "Not set"}</div>
				</div>
				<Chevron direction="right" className="size-4 ml-auto" />
			</button>

			<button
				className="my-4 btn btn-block text-left h-16"
				onClick={() => navigationStack.next({ key: "origin" })}
			>
				<div>
					<div className="text-xs text-base-content/60 mb-1">Origin</div>
					<div>
						{!values.origin && "Not set"}
						{values.origin && origins.data && origins.data[values.origin.path.join(".")]?.name}
					</div>
				</div>
				<Chevron direction="right" className="size-4 ml-auto" />
			</button>

			<fieldset className="fieldset my-4">
				<legend className="fieldset-legend">Altitude</legend>
				<input
					type="text"
					className="input w-full"
					pattern="[ ,.0-9]+"
					inputMode="numeric"
					min={0}
					name="altitude"
				/>
			</fieldset>
		</PageLayout>
	);
}
