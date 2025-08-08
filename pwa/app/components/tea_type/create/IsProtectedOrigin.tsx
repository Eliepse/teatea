import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import { handleUIEvent } from "~/utils/function";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTeaTypeFormContext } from "~/components/tea_type/CreateTeaTypeFlow";

/**
 * @see https://en.wikipedia.org/wiki/Protected_designation_of_origin
 */

export function IsProtectedOrigin() {
	const context = useTeaTypeFormContext();
	const navigationStack = useStackNavigator();

	function yes() {
		context.patchForm({ isProtectedOrigin: true });
		navigationStack.next({ key: "family:select" });
	}

	function no() {
		context.patchForm({ isProtectedOrigin: false });
		navigationStack.next({ key: "family:select" });
	}

	return (
		<PageLayout
			title="Is it a protected appellation?"
			onBack={navigationStack.back}
			bodyClassName="flex flex-col justify-end"
		>
			<div>
				<button className="btn btn-block h-16 mb-4" onClick={handleUIEvent(no)}>
					<span>No / I don't know</span>
					<XMarkIcon className="size-4 ml-auto" />
				</button>

				<button className="btn btn-block h-16 mb-4" onClick={handleUIEvent(yes)}>
					<span>Yes</span>
					<CheckIcon className="size-4 ml-auto" />
				</button>
			</div>
		</PageLayout>
	);
}
