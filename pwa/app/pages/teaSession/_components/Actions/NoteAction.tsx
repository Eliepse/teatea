import { Fragment, useState } from "react";
import { AlignLeft, FireFlame, SnowFlake } from "iconoir-react";
import { Modal } from "~/components/shared/modal/Modal";
import { SessionAction } from "~/pages/teaSession/_components/Actions/SessionAction";
import { useMutation } from "@tanstack/react-query";
import { makePathTeaSessionMutationOpt } from "~/utils/command/updateTeaSessionCommand";
import { type BrewingType, BrewingTypeEnum, type TeaSession } from "~t/types";
import { f, handleUIEvent } from "~/utils/function";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";

export const TypeIcon = {
	[BrewingTypeEnum.Hot]: <FireFlame className="size-5" />,
	[BrewingTypeEnum.Cold]: <SnowFlake className="size-5" />,
} as const;

export function NoteAction(props: {
	session: Pick<TeaSession, "@id" | "note">;
	readonly?: boolean;
	updated?: () => void;
}) {
	const [edit, setEdit] = useState(false);
	const [value, setValue] = useState(props.session.note);
	const filled = !!props.session.note?.trim();
	const mutation = useMutation(makePathTeaSessionMutationOpt(props.session["@id"]));

	async function persistChange() {
		const note = value?.trim() || undefined;

		if (note === props.session.note) {
			return;
		}

		await mutation.mutateAsync({ note: note || "" });
		setEdit(false);
		f(props.updated)();
	}

	return (
		<Fragment>
			<SessionAction onClick={() => setEdit(true)} readonly={props.readonly} filled={filled}>
				<AlignLeft className="size-5" />
				{filled ? "Edit notes" : "Add notes"}
			</SessionAction>

			{!props.readonly && (
				<Modal open={edit} className="p-4" onClose={() => setEdit(false)}>
					<div className="flex mb-4 gap-4">
						<SecondaryButton className="flex-1" onClick={() => setEdit(false)}>
							Cancel
						</SecondaryButton>
						<PrimaryButton
							className="flex-2"
							onClick={() => persistChange()}
							disabled={mutation.isPending}
						>
							Save
						</PrimaryButton>
					</div>

					<textarea
						className="textarea w-full h-96"
						onChange={(e) => setValue(e.currentTarget.value)}
						value={value}
					/>
				</Modal>
			)}
		</Fragment>
	);
}
