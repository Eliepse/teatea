import { Fragment, useState } from "react";
import { EmojiPuzzled, EmojiSad, EmojiSatisfied, EmojiThinkLeft } from "iconoir-react";
import { Modal } from "~/components/shared/modal/Modal";
import { SessionAction } from "~/pages/teaSession/_components/Actions/SessionAction";
import { useMutation } from "@tanstack/react-query";
import { makePathTeaSessionMutationOpt } from "~/utils/command/updateTeaSessionCommand";
import { type BrewingQuality, BrewingQualityEnum, type TeaSession } from "~t/types";
import { f } from "~/utils/function";
import { PrimaryButton } from "~/shared/components/Button";
import { BrewingQualityInput, QualityLabel } from "~/components/shared/inputs/BrewingQualityInput";

const QualityIcon = {
	[BrewingQualityEnum.Good]: <EmojiSatisfied className="size-5" />,
	[BrewingQualityEnum.Improvable]: <EmojiThinkLeft className="size-5" />,
	[BrewingQualityEnum.Bad]: <EmojiSad className="size-5" />,
} as const;

export function RateTechnicAction(props: {
	session: Pick<TeaSession, "@id" | "quality">;
	readonly?: boolean;
	updated?: () => void;
}) {
	const [edit, setEdit] = useState(false);
	const value = props.session.quality;
	const filled = undefined !== value;
	const mutation = useMutation(makePathTeaSessionMutationOpt(props.session["@id"]));

	async function persistChange(quality: BrewingQuality) {
		if (quality === props.session.quality) {
			return;
		}

		await mutation.mutateAsync({ quality });
		setEdit(false);
		f(props.updated)();
	}

	return (
		<Fragment>
			<SessionAction onClick={() => setEdit(true)} readonly={props.readonly} filled={filled}>
				{filled ? QualityIcon[value] : <EmojiPuzzled className="size-5" />}
				{filled ? QualityLabel[value] : "Rate brew"}
			</SessionAction>

			{!props.readonly && (
				<Modal open={edit} className="p-4" onClose={() => setEdit(false)}>
					<div className="px-4 py-6">
						<BrewingQualityInput value={value} onChange={persistChange} />
						<PrimaryButton className="mt-4 w-full" onClick={() => setEdit(false)}>
							Close
						</PrimaryButton>
					</div>
				</Modal>
			)}
		</Fragment>
	);
}
