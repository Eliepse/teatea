import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useTeaFormContext } from "./AddTeaForm";
import { Check } from "~/components/icons/Check";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import { type ChangeEvent, useState } from "react";
import { handleUIEvent } from "~/utils/function";
import clsx from "clsx";

export function TeaTypeForm() {
	const context = useTeaFormContext();
	const navigationStack = useStackNavigator();
	const [typeName, setTypeName] = useState("");
	const hasCustomName = !!context.formValue.type || typeName.trim().length !== 0;

	function nameChanged(e: ChangeEvent<HTMLInputElement>) {
		setTypeName(e.currentTarget.value.trim());
	}

	function handleSubmit() {
		context.patchForm({ type: { name: typeName } });
		navigationStack.next({ key: "recap" });
	}

	return (
		<PageLayout
			title="Does it have a name?"
			onBack={navigationStack.back}
			action={
				<div className="flex justify-center">
					<button
						className={clsx("ml-2 btn rounded-full", hasCustomName ? "btn-primary" : "btn-secondary")}
						onClick={handleUIEvent(handleSubmit)}
					>
						{hasCustomName ? "Next" : "Skip"}
						{hasCustomName && <Check className="size-4 ml-1" />}
					</button>
				</div>
			}
		>
			<fieldset className="fieldset my-4">
				<legend className="fieldset-legend">Type name</legend>
				<input type="text" className="input w-full" name="name" value={typeName} onChange={nameChanged} />
				<p className="fieldset-legend">If this tea has a special name</p>
			</fieldset>
		</PageLayout>
	);
}
