import { Fragment, useState } from "react";
import { FireFlame, SnowFlake } from "iconoir-react";
import { Modal } from "~/components/shared/modal/Modal";
import { SessionAction } from "~/pages/teaSession/_components/Actions/SessionAction";
import { useMutation } from "@tanstack/react-query";
import { makePathTeaSessionMutationOpt } from "~/utils/command/updateTeaSessionCommand";
import  { type BrewingType, BrewingTypeEnum, type TeaSession } from "~t/types";
import { BrewingTypeInput, TypeLabel } from "~/components/shared/inputs/BrewingTypeInput";
import { PrimaryButton } from "~/shared/components/Button";
import { f } from "~/utils/function";

export const TypeIcon = {
	[BrewingTypeEnum.Hot]: <FireFlame className="size-5" />,
	[BrewingTypeEnum.Cold]: <SnowFlake className="size-5" />,
} as const;

export function BrewingTypeAction(props: {
	session: Pick<TeaSession, "@id" | "brewingType">;
	readonly?: boolean;
	updated?: () => void;
}) {
	const [edit, setEdit] = useState(false);
	const type = props.session.brewingType;
	const filled = !!type;
	const mutation = useMutation(makePathTeaSessionMutationOpt(props.session["@id"]));

	async function persistChange(type: BrewingType) {
		if (type === props.session.brewingType) {
			return;
		}

		await mutation.mutateAsync({ brewingType: type });
		setEdit(false);
		f(props.updated)();
	}

	return (
		<Fragment>
			<SessionAction onClick={() => setEdit(true)} readonly={props.readonly} filled={filled}>
				{filled ? (
					<Fragment>
						{TypeIcon[type]}
						{TypeLabel[type]}
					</Fragment>
				) : (
					<Fragment>
						<FireFlame className="size-5" />
						Brewing type
					</Fragment>
				)}
			</SessionAction>

			{!props.readonly && (
				<Modal open={edit}>
					<div className="px-4 py-6">
						<BrewingTypeInput value={props.session.brewingType} onChange={persistChange} />
						<PrimaryButton className="mt-4 w-full" onClick={() => setEdit(false)}>
							Close
						</PrimaryButton>
					</div>
				</Modal>
			)}
		</Fragment>
	);
}
