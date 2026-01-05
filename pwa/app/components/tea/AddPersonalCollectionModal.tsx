import type { Iri } from "~t/types";
import { Modal } from "~/components/shared/modal/Modal";
import { useState } from "react";
import { EcologyBook } from "iconoir-react";
import { useNavigate } from "react-router";
import { useAlert } from "~/components/shared/modal/AlertManager";
import { StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { useMutation } from "@tanstack/react-query";
import { formatISO } from "date-fns";
import { postApi } from "~/utils/api";
import { useToken } from "~/auth/hooks/useToken";
import type { CollectionTeaRaw } from "~/utils/api/normalization/collectionTea";
import { SteppedModalFormLayout } from "~/components/shared/form/modal-multistep/SteppedModalFormLayout";
import { DatePickerStep } from "~/components/shared/form/modal-multistep/DatePickerStep";
import { BusinessPickerStep } from "~/components/shared/form/modal-multistep/BusinessPickerStep";

type CollectionTeaForm = {
	tea: Iri;
	acquiredAt?: Date;
	acquiredFrom?: Iri;
};

const FRAME_INFO_MAPPER = {
	"date:select": { step: 1, title: "When did you bought it?" },
	"business:select": { step: 2, title: "Where did you bought it?" },
} as const;

export function AddPersonalCollectionModal(props: { tea: Iri; onClose: () => void; open: boolean }) {
	const [token] = useToken();
	const navigate = useNavigate();
	const alert = useAlert();
	const [form, setForm] = useState<CollectionTeaForm>({ tea: props.tea });
	const { NavigationStack, ...stackNavigator } = useNavigationStack({ defaultFrame: "date:select" });
	const currentFrameKey = stackNavigator.stack.slice(-1)[0] as keyof typeof FRAME_INFO_MAPPER;

	function goBack() {
		if (1 === stackNavigator.stack.length) {
			props.onClose();
			return;
		}

		stackNavigator.back();
		return;
	}

	const mutation = useMutation({
		mutationFn: async (data: CollectionTeaForm) => {
			if (!token?.username) {
				throw new Error("Token invalid");
			}

			const acquiredAt = data.acquiredAt ? formatISO(data.acquiredAt) : undefined;
			const response = await postApi<CollectionTeaRaw>(`/members/${token?.username}/teas`, {
				...data,
				acquiredAt,
			});
			return await response.json();
		},
		onError: (e) => {
			alert({ title: "Error while updation your collection", body: e.message });
		},
		onSuccess: (data) => {
			setTimeout(() => navigate(`/members/${token?.username}/teas/${data.id}`), 500);
		},
	});

	if (mutation.isPending || mutation.isSuccess) {
		return (
			<Modal onClose={props.onClose} open={props.open} position="bottom" className="p-0 h-1/3">
				<div className="flex items-center justify-center h-full text-lg text-green-700">
					<div>
						<EcologyBook className="mx-auto mb-4 size-14 animate-bounce text-green-600" />
						<span className="ml-2 font-medium">Updating your collection...</span>
					</div>
				</div>
			</Modal>
		);
	}

	const progress = (FRAME_INFO_MAPPER[currentFrameKey].step / Object.values(FRAME_INFO_MAPPER).length) * 100;

	return (
		<Modal onClose={props.onClose} open={props.open} position="bottom" className="h-max p-0 overflow-auto">
			<SteppedModalFormLayout
				title={FRAME_INFO_MAPPER[currentFrameKey].title}
				progress={progress}
				onBack={goBack}
			>
				<NavigationStack>
					<StackFrame frameKey="date:select">
						<DatePickerStep
							onNext={(acquiredAt) => {
								setForm((st) => ({ ...st, acquiredAt }));
								stackNavigator.next("business:select");
							}}
							allowEmpty
						/>
					</StackFrame>
					<StackFrame frameKey="business:select">
						<BusinessPickerStep
							onConfirm={(business) => {
								setForm((st) => ({ ...st, acquiredFrom: business }));
								mutation.mutate({ ...form, acquiredFrom: business });
							}}
							allowEmpty
						/>
					</StackFrame>
				</NavigationStack>
			</SteppedModalFormLayout>
		</Modal>
	);
}
