import { PageLayout } from "~/components/shared/paged/PageLayout";
import { Check } from "~/components/icons/Check";
import Chevron from "~/components/icons/chevron";
import { useOriginByPath } from "~/utils/api/useOrigins";
import { teaFamilies } from "~t/types";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import { handleUIEvent } from "~/utils/function";
import { useTeaTypeFormContext } from "~/components/tea_type/create/CreateTeaTypeFlow";

export function ConfirmNewTeaType() {
	const context = useTeaTypeFormContext();
	const navigationStack = useStackNavigator();
	const origins = useOriginByPath();
	const values = context.formValue;

	function handleSubmit() {
		void context.submit();
	}

	return (
		<PageLayout
			title="Is it all good?"
			onBack={context.submitting ? false : navigationStack.back}
			action={
				<div className="flex justify-center">
					<button className="flex-1 btn btn-primary" onClick={handleSubmit} disabled={context.submitting}>
						{context.submitting ? "Saving..." : "Submit a new type"}
						{!context.submitting && <Check className="size-4 ml-1" />}
					</button>
				</div>
			}
		>
			<button
				className="my-4 btn btn-block text-left h-16"
				onClick={handleUIEvent(() => navigationStack.next({ key: "origin:select" }))}
			>
				<div>
					<div className="text-xs text-base-content/60 mb-1">Origin</div>
					<div>
						{!values.origin && "Not set"}
						{values.origin && values.origin.name}
					</div>
				</div>
				<Chevron direction="right" className="size-4 ml-auto" />
			</button>

			<button
				className="mb-4 btn btn-block text-left h-16"
				onClick={handleUIEvent(() => navigationStack.next({ key: "family:select" }))}
			>
				<div>
					<div className="text-xs text-base-content/60 mb-1">Family</div>
					<div>{values.family ? teaFamilies[values.family] : "Not set"}</div>
				</div>
				<Chevron direction="right" className="size-4 ml-auto" />
			</button>

			<button
				className="my-4 btn btn-block text-left h-16"
				onClick={() => navigationStack.next({ key: "name:ask" })}
			>
				<div>
					<div className="text-xs text-base-content/60 mb-1">Name</div>
					<div>{context.formValue.name ?? "Not set"}</div>
				</div>
				<Chevron direction="right" className="size-4 ml-auto" />
			</button>
		</PageLayout>
	);
}
