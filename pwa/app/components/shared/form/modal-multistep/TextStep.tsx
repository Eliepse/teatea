import { type ChangeEvent, useState } from "react";
import { NextButton } from "~/components/shared/form/modal-multistep/NextButton";

export function TextStep(props: {
	defaultValue?: string;
	allowEmpty?: boolean;
	onConfirm: (string?: string) => Promise<void> | void;
}) {
	const [pending, setPending] = useState(false);
	const [value, setValue] = useState(props.defaultValue ?? "");

	async function handleConfirm() {
		setPending(true);
		await props.onConfirm(value);
		setPending(false);
	}

	function handleTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
		setValue(e.target.value);
	}

	return (
		<>
			<textarea className="textarea w-full h-96 text-lg rounded-xl" onChange={handleTextChange} value={value} />

			<div className="mt-4 sticky bottom-0 bg-white">
				<NextButton
					onClick={handleConfirm}
					disabled={!props.allowEmpty && !value.trim()}
					loading={pending}
					label="Next"
				/>
			</div>
		</>
	);
}
