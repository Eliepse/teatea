import { type MouseEvent, type PropsWithChildren, useState } from "react";
import type { Iri } from "~t/types";
import { AddPersonalCollectionModal } from "~/components/tea/AddPersonalCollectionModal";

export function AddToPersonalCollectionButton(props: PropsWithChildren<{ tea: Iri; className?: string }>) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	function openModal(e: MouseEvent) {
		e.stopPropagation();
		setIsModalOpen(true);
	}

	return (
		<div onClick={openModal} className={props.className}>
			{props.children}
			<AddPersonalCollectionModal tea={props.tea} onClose={() => setIsModalOpen(false)} open={isModalOpen} />
		</div>
	);
}
