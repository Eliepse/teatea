import { PageLayout } from "~/components/shared/paged/PageLayout";
import { teaFamilies, type TeaFamily } from "~t/types";
import clsx from "clsx";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import { handleUIEvent } from "~/utils/function";
import { useTeaTypeFormContext } from "~/components/tea_type/create/CreateTeaTypeFlow";

export function SelectFamily() {
	const context = useTeaTypeFormContext();
	const navigationStack = useStackNavigator();
	const selectedFamily = context.formValue.family;

	function selectFamily(family: TeaFamily | undefined): void {
		context.patchForm({ family });
		navigationStack.next({ key: "name:ask" });
	}

	return (
		<PageLayout title="Which family is it part of?" onBack={navigationStack.back} bodyClassName="flex flex-col">
			<ul className="mt-auto">
				{Object.entries(teaFamilies).map(([key, label]) => (
					<li key={key}>
						<button
							onClick={handleUIEvent(() => selectFamily(key as TeaFamily))}
							className={clsx(
								"mb-2 btn btn-block h-16 justify-start",
								selectedFamily === key && "btn-primary",
							)}
						>
							{label}
						</button>
					</li>
				))}
			</ul>
		</PageLayout>
	);
}
