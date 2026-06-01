import type { Iri } from "~t/types";
import { useState } from "react";
import { Modal } from "~/components/shared/modal/Modal";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";
import { CultivarSelect, type NewCultivar } from "~/catalog/components/cultivar/CultivarSelect";

export function CultivarSelectModal(props: {
	open: boolean;
	onClose: () => void;
	onSelect: (value?: Iri | NewCultivar) => void;
	defaultValue?: Iri | NewCultivar;
	allowToggle?: boolean;
	allowCreate?: boolean;
}) {
	const [selectedCultivar, setSelectedCultivar] = useState<Iri | NewCultivar | undefined>(props.defaultValue);

	function cancel() {
		setSelectedCultivar(props.defaultValue);
		props.onClose();
	}

	function confirm() {
		props.onSelect(selectedCultivar);
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

			<CultivarSelect
				value={selectedCultivar}
				onChange={setSelectedCultivar}
				onCreated={(cultivar) => setSelectedCultivar("@id" in cultivar ? cultivar["@id"] : cultivar)}
				className="mx-6"
				allowToggle
				allowCreate
			/>
		</Modal>
	);
}
