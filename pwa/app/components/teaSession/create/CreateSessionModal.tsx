import type { CollectionTea, Tea } from "~t/types";
import { Modal } from "~/components/shared/modal/Modal";
import { CreateTeaSessionFlow } from "~/components/teaSession/CreateTeaSessionFlow";

export function CreateSessionModal(props: {
	tea: Pick<Tea | CollectionTea, "@id" | "id" | "@type">;
	onClose: () => void;
	open: boolean;
}) {
	return (
		<Modal onClose={props.onClose} open={props.open} className="p-0">
			<CreateTeaSessionFlow tea={props.tea} onCancel={props.onClose} />
		</Modal>
	);
}
