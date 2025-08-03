import { PageLayout } from "~/components/shared/paged/PageLayout";
import { teaFamilies, type TeaFamily } from "~t/types";
import clsx from "clsx";
import { Check } from "~/components/icons/Check";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import { handleUIEvent } from "~/utils/function";
import { useTeaTypeFormContext } from "~/components/tea_type/create/CreateTeaTypeFlow";

export function SelectFamily() {
	const context = useTeaTypeFormContext();
	const navigationStack = useStackNavigator();
	const selectedFamily = context.formValue.family;

	function changeFamily(family: TeaFamily | undefined): void {
		context.patchForm({ family });
	}

	function confirm() {
		navigationStack.next({ key: "name:ask" });
	}

	return (
		<PageLayout
			title="Which family is it part of?"
			onBack={navigationStack.back}
			action={
				<div className="flex justify-center">
					{!!selectedFamily && (
						<button className="ml-2 btn btn-primary rounded-full" onClick={handleUIEvent(confirm)}>
							Confirm
							<Check className="size-4 ml-1" />
						</button>
					)}
				</div>
			}
		>
			{Object.entries(teaFamilies).map(([key, label]) => (
				<button
					key={key}
					onClick={handleUIEvent(() => changeFamily(key as TeaFamily))}
					className={clsx("mb-2 btn btn-block h-12 justify-start", selectedFamily === key && "btn-primary")}
				>
					{label}
				</button>
			))}
		</PageLayout>
	);
}
