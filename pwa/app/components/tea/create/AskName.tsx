import { PageLayout } from "~/components/shared/paged/PageLayout";
import { type ChangeEvent, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

/**
 * @see https://en.wikipedia.org/wiki/Protected_designation_of_origin
 */

export function AskName(props: { onConfirm: (name: string) => void; defaultValue?: string; onBack: () => void }) {
	const [name, setName] = useState(props.defaultValue ?? "");
	const isNameValid = 0 < name.trim().length;

	function confirm() {
		if (0 === name.trim().length) {
			return;
		}

		props.onConfirm(name.trim());
	}

	function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
		setName(e.currentTarget.value);
	}

	function handleInputBlur() {
		setName((value) => value.trim());
	}

	return (
		<PageLayout
			title="How is it called?"
			onBack={props.onBack}
			bodyClassName="flex flex-col justify-center"
			action={
				<button className="ml-auto btn btn-primary" onClick={confirm} disabled={!isNameValid}>
					Next
					<ArrowRightIcon className="size-4" />
				</button>
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
