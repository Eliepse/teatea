import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";
import { type ChangeEvent, useState } from "react";
import { useTeaTypeFormContext } from "~/components/tea_type/CreateTeaTypeFlow";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

/**
 * @see https://en.wikipedia.org/wiki/Protected_designation_of_origin
 */

export function AskName() {
	const context = useTeaTypeFormContext();
	const navigationStack = useStackNavigator();
	const [name, setName] = useState("");
	const isNameValid = 0 < name.trim().length;

	function confirm() {
		if(0 === name.trim().length) {
			return;
		}

		context.patchForm({ name: name.trim() });
		navigationStack.next("recap:confirm");
	}

	function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
		const value = e.currentTarget.value;
		setName(value);
	}

	function handleInputBlur() {
		setName((value) => value.trim());
	}

	return (
		<PageLayout
			title="How is it called?"
			onBack={navigationStack.back}
			bodyClassName="flex flex-col justify-center"
			action={
				<div className="flex justify-center">
					<button className="ml-auto btn btn-primary" onClick={confirm} disabled={!isNameValid}>
						Next
						<ArrowRightIcon className="size-4" />
					</button>
				</div>
			}
		>
			<div>
				<fieldset className="fieldset my-4">
					<legend className="fieldset-legend">Type name</legend>
					<input
						type="text"
						className="input w-full"
						name="name"
						value={name}
						onChange={handleInputChange}
						onBlur={handleInputBlur}
					/>
				</fieldset>
			</div>
		</PageLayout>
	);
}
