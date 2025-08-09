import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useTeaFormContext } from "../../tea/CreateTeaFlow";
import { Check } from "~/components/icons/Check";
import Chevron from "~/components/icons/chevron";
import { teaFamilies } from "~t/types";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import { handleUIEvent } from "~/utils/function";

export function TeaFormConfirmation(props: {
	values: ReturnType<typeof useTeaFormContext>["formValue"];
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
				onClick={handleUIEvent(() => navigationStack.next({ key: "origin:select" }))}
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
				onClick={handleUIEvent(() => navigationStack.next({ key: "family:select" }))}
			>
				<div>
					<div className="text-xs text-base-content/60 mb-1">Type</div>
					<div>{props.values.family ? teaFamilies[props.values.family] : "Not set"}</div>
				</div>
				<Chevron direction="right" className="size-4 ml-auto" />
			</button>

			<button
				className="my-4 btn btn-block text-left h-16"
				onClick={() => navigationStack.next({ key: isExistingType ? "type:select" : "name:ask" })}
			>
				<div>
					<div className="text-xs text-base-content/60 mb-1">Type</div>
					<div>{props.values.type ? props.values.type.name : "Not set"}</div>
				</div>
				<Chevron direction="right" className="size-4 ml-auto" />
			</button>
		</PageLayout>
	);
}
