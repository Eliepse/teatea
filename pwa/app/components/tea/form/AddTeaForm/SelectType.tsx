import { PageLayout } from "~/components/shared/paged/PageLayout";
import { teaFamilies, type TeaFamily, type TeaType } from "~t/types";
import { useTeaFormContext } from "./AddTeaForm";
import Chevron from "~/components/icons/chevron";
import clsx from "clsx";
import { Check } from "~/components/icons/Check";
import { useTeaTypes } from "~/utils/api/useTeaTypes";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";

export function SelectType() {
	const { data, isLoading } = useTeaTypes();
	const context = useTeaFormContext();
	const navigationStack = useStackNavigator();
	const selectedFamily = context.formValue.family;
	const selectedType = data && selectedFamily ? context.formValue.type : undefined;
	const children = data && selectedFamily ? data[selectedFamily] : [];

	function clear() {
		context.updateForm((form) => ({ ...form, family: undefined, type: undefined }));
	}

	function changeFamily(family: TeaFamily | undefined): void {
		context.updateForm((form) => ({ ...form, family }));
	}

	function changeType(type: TeaType | undefined): void {
		context.updateForm((form) => ({ ...form, type }));
	}

	function confirm() {
		navigationStack.next({ key: context.formValue.origin ? "other" : "origin" });
	}

	return (
		<PageLayout
			title="What type of tea is it?"
			onBack={navigationStack.back}
			action={
				<div className="flex justify-center">
					{!!selectedType || (0 !== children.length) && (
						<button className="btn rounded-full mr-auto" onClick={clear}>
							Back
						</button>
					)}

					{!!selectedFamily && (
						<button className="ml-2 btn btn-primary rounded-full" onClick={confirm}>
							{selectedType?.name || teaFamilies[selectedFamily]}
							<Check className="size-4 ml-1" />
						</button>
					)}
				</div>
			}
		>
			{isLoading && "Loading..."}

			{children.length === 0 &&
				data &&
				Object.entries(teaFamilies).map(([key, label]) => (
					<button
						key={key}
						onClick={() => changeFamily(key as TeaFamily)}
						className={clsx("mb-2 btn btn-block h-12", selectedFamily === key && "btn-primary")}
					>
						{label}{" "}
						<Chevron
							direction="right"
							className={clsx("size-4 ml-auto", data[key as TeaFamily].length === 0 && "invisible")}
						/>
					</button>
				))}

			{children.map((type) => (
				<button
					key={type.id}
					onClick={() => changeType(type)}
					className={clsx("mb-2 btn btn-block h-12", selectedType?.id === type.id && "btn-primary")}
				>
					{type.name}
				</button>
			))}
		</PageLayout>
	);
}
