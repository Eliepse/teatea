import type { Iri } from "~t/types";
import { useState } from "react";
import { Modal } from "~/components/shared/modal/Modal";
import { TextStep } from "~/components/shared/form/modal-multistep/TextStep";
import { useCollectionTeaMutations } from "~/hooks/tea/useCollectionTeaMutations";
import { useRevalidator } from "react-router";
import { AlignLeft, Edit } from "iconoir-react";

export function EditableDescription(props: { collTeaIri: Iri; value?: string; className?: string }) {
	const [modal, setModal] = useState(false);
	const revalidator = useRevalidator();
	const mutations = useCollectionTeaMutations(props.collTeaIri);

	async function applyChanges(text?: string) {
		await mutations.patch.mutateAsync({ description: text ?? null });
		await revalidator.revalidate();
		setModal(false);
	}

	return (
		<div className={props.className}>
			{!props.value && (
				<button
					className="mx-auto p-2 flex items-center justify-center text-green-600 cursor-pointer hover:text-green-900"
					onClick={() => setModal(true)}
				>
					Add a description <AlignLeft className="size-4 ml-2" />
				</button>
			)}
			{!!props.value && (
				<div className="px-4 py-3 bg-white rounded-xl shadow-xs">
					<p className="text-green-900">{props.value}</p>
					<button
						className="flex items-center justify-center w-full pt-2 mt-3 border-t border-green-300 text-green-700 text-sm"
						onClick={() => setModal(true)}
					>
						Edit the description
						<Edit className="size-4 ml-2" />
					</button>
				</div>
			)}
			<Modal onClose={() => setModal(false)} open={modal} position="bottom">
				<TextStep onConfirm={applyChanges} defaultValue={props.value} />
			</Modal>
		</div>
	);
}
