import type { Iri } from "~t/types";
import type { IForm } from "~/catalog/mutation/createBusinessMutation";
import { useState } from "react";
import { BusinessSelect, type NewBusiness } from "~/catalog/components/business/BusinessSelect";
import { Modal } from "~/components/shared/modal/Modal";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";

export function BusinessSelectModal(props: {
	open: boolean;
	onClose: () => void;
	onSelect: (value?: Iri | IForm) => void;
	defaultValue?: Iri | IForm;
	allowToggle?: boolean;
	allowCreate?: boolean;
}) {
	const [selectedBusiness, setSelectedBusiness] = useState<Iri | NewBusiness | undefined>(props.defaultValue);

	function cancel() {
		setSelectedBusiness(props.defaultValue);
		props.onClose();
	}

	function confirm() {
		props.onSelect(selectedBusiness);
		props.onClose();
	}

	return (
		<Modal open={props.open} onClose={props.onClose} className="pb-6 h-full">
			<div className="flex gap-4 p-4 mb-4 border-b border-green-200 sticky top-0 z-10 bg-white">
				<SecondaryButton className="flex-1" onClick={cancel}>
					Cancel
				</SecondaryButton>
				<PrimaryButton className="flex-2" onClick={confirm}>
					Confirm
				</PrimaryButton>
			</div>

			<BusinessSelect
				value={selectedBusiness}
				onChange={setSelectedBusiness}
				onCreated={(business) => setSelectedBusiness("@id" in business ? business["@id"] : business)}
				className="mx-6"
				allowToggle
				allowCreate
			/>
		</Modal>
	);
}
