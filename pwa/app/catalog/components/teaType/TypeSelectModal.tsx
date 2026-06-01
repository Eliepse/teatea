import type { Iri } from "~t/types";
import { useState } from "react";
import { Modal } from "~/components/shared/modal/Modal";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";
import { type NewType, TypeSelect } from "~/catalog/components/teaType/TypeSelect";

export function TypeSelectModal(props: {
	open: boolean;
	onClose: () => void;
	onSelect: (value?: Iri | NewType) => void;
	defaultValue?: Iri | NewType;
	allowToggle?: boolean;
	allowCreate?: boolean;
}) {
	const [selectedType, setSelectedType] = useState<Iri | NewType | undefined>(props.defaultValue);

	function cancel() {
		setSelectedType(props.defaultValue);
		props.onClose();
	}

	function confirm() {
		props.onSelect(selectedType);
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

			<TypeSelect
				value={selectedType}
				onChange={setSelectedType}
				onCreated={(type) => setSelectedType("@id" in type ? type["@id"] : type)}
				className="mx-6"
				allowToggle={props.allowToggle}
				allowCreate={props.allowCreate}
			/>
		</Modal>
	);
}
