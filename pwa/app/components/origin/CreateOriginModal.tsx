import type { Origin } from "~t/types";
import { Modal } from "~/components/shared/modal/Modal";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";
import { f } from "~/utils/function";
import { useState } from "react";
import { TextInput } from "~/shared/components/Form/TextInput";

export function CreateOriginModal(props: {
	open: boolean;
	onClose?: () => void;
	onConfirm: (origin: { name: string }) => Promise<void>;
}) {
	const [isPending, setPending] = useState(false);
	const [data, setData] = useState<Partial<Pick<Origin, "name">>>({});
	const isNameValid = 2 < (data?.name?.length ?? 0);

	function submit() {
		const name = data.name;

		if (!name || 2 >= name.length) {
			return;
		}

		setPending(true);
		props.onConfirm({ name }).finally(() => setPending(false));
	}

	function cancel() {
		f(props.onClose)();
	}

	return (
		<Modal open={props.open} onClose={props.onClose} className="p-0">
			<div className="flex gap-4 p-4 mb-4 border-b border-green-200">
				<SecondaryButton className="flex-1" onClick={cancel}>
					Cancel
				</SecondaryButton>

				<PrimaryButton
					className="flex-2"
					onClick={submit}
					disabled={!isNameValid || isPending}
					loading={isPending}
				>
					Create
				</PrimaryButton>
			</div>

			<div className="m-4">
				<label>
					<span className="block mb-2 text-green-800">Name</span>
					<TextInput value={data.name} onChange={(v) => setData({ name: v })} disabled={isPending} />
				</label>
			</div>
		</Modal>
	);
}
