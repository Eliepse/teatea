import { PageLayout } from "~/components/shared/paged/PageLayout";
import { teaFamilies, type TeaFamily } from "~t/types";
import { useTeaFormContext } from "./AddTeaForm";
import clsx from "clsx";
import { Check } from "~/components/icons/Check";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import { handleUIEvent } from "~/utils/function";

export function SelectFamily() {
	const context = useTeaFormContext();
	const navigationStack = useStackNavigator();
	const selectedFamily = context.formValue.family;

	function changeFamily(family: TeaFamily | undefined): void {
		context.updateForm((form) => ({ ...form, family }));
	}

	function confirm() {
		navigationStack.next({ key: "typeName" });
	}

	return (
		<PageLayout
			title="Which family?"
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
