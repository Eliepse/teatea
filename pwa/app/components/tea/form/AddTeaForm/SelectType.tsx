import { PageLayout } from "~/components/shared/paged/PageLayout";
import { type TeaType } from "~t/types";
import { useTeaFormContext } from "./AddTeaForm";
import { Check } from "~/components/icons/Check";
import { useState } from "react";
import clsx from "clsx";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import { useTeaTypes } from "~/utils/api/useTeaTypes";
import { handleUIEvent } from "~/utils/function";
import Arrow from "~/components/icons/arrow";
import Plus from "~/components/icons/plus";

export function SelectType() {
	const context = useTeaFormContext();
	const { data: types, isLoading } = useTeaTypes({
		family: context.formValue.family,
		originPath: context.formValue.origin?.path[0] ?? undefined,
	});
	const navigationStack = useStackNavigator();
	const [selection, setSelection] = useState<TeaType | undefined>();

	function toggleType(type: TeaType) {
		setSelection((st) => (st === type ? undefined : type));
	}

	function confirm() {
		context.patchForm({ type: selection });
		navigationStack.next({ key: "family" });
	}

	return (
		<PageLayout
			title="Where does it come from?"
			onBack={navigationStack.back}
			bodyClassName="pb-20"
			action={
				<div className="flex justify-center">
					{selection && (
						<button className="ml-2 btn btn-primary rounded-full" onClick={handleUIEvent(confirm)}>
							{selection.name}
							<Check className="size-4 ml-1" />
						</button>
					)}

					{undefined === selection && (
						<button className="ml-2 btn rounded-full" onClick={handleUIEvent(confirm)}>
							I don't know <Arrow direction="right" className="size-4 ml-1" />
						</button>
					)}
				</div>
			}
		>
			{isLoading && "Loading..."}

			{types?.member?.map((type) => (
				<button
					key={type.id}
					onClick={handleUIEvent(() => toggleType(type))}
					className={clsx(
						"mb-2 btn btn-block h-12 justify-start",
						selection?.id === type.id && "btn-primary",
					)}
				>
					{type.name}
				</button>
			))}

			{false === isLoading && (
				<button
					onClick={handleUIEvent(() => navigationStack.next({ key: "type:new" }))}
					className="mb-2 btn btn-dash btn-block h-12 justify-start"
				>
					Add a new type
					<Plus className="ml-auto size-4" />
				</button>
			)}
		</PageLayout>
	);
}
