import { useState } from "react";
import type { Tea } from "~t/types";
import { brewingTechnic, type TechnicType } from "~/components/shared/BrewingTechnic";
import { StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { SelectTeaFrame } from "~/components/stackFrames/SelectTeaFrame";
import { ParametersInput } from "~/components/teaSession/create/ParametersInput";
import { FrameDatePicker } from "~/components/shared/frame/FrameDatePicker";
import { useMutation } from "@tanstack/react-query";
import Leaf from "~/components/icons/leaf";
import { fetchApi } from "~/utils/api";
import type { TeaSessionRaw } from "~/utils/api/normalization/teaSession";
import { formatISO } from "date-fns";
import { useNavigate } from "react-router";
import { useAlert } from "~/components/shared/modal/AlertManager";

export type SessionForm = {
	tea?: Tea;
	teaQuantity?: number;
	waterVolume?: number;
	drankAt: Date;
	technic?: TechnicType | null;
};

const technicItems = Object.entries(brewingTechnic).map(([k, l]) => ({ value: k, label: l })) as {
	value: TechnicType;
	label: string;
}[];

export function CreateTeaSessionFlow(props: { tea?: Tea; onBack: () => void }) {
	const navigate = useNavigate();
	const alert = useAlert();
	const [form, setForm] = useState<SessionForm>({ drankAt: new Date(), tea: props.tea });
	const { NavigationStack, ...stackNavigator } = useNavigationStack({
		defaultFrame: props.tea?.id ? "parameters:input" : "tea:select",
	});

	function goBack() {
		if(1 === stackNavigator.stack.length) {
			props.onBack();
			return;
		}

		stackNavigator.back();
		return;
	}

	const mutation = useMutation({
		mutationFn: async (data: SessionForm & Required<Pick<SessionForm, "tea">>) => {
			const response = await fetchApi<TeaSessionRaw>("/tea_sessions", {
				method: "POST",
				payload: {
					drankAt: formatISO(data.drankAt),
					tea: data.tea?.["@id"],
					technic: data.technic,
					teaQuantity: data.teaQuantity,
					waterMl: data.waterVolume,
				},
			});

			return await response.json();
		},
		onError: (e) => {
			alert({ title: "Error while saving your experience", body: e.message });
		},
		onSuccess: (data) => {
			setTimeout(() => navigate(`/sessions/${data.id}?edit=1`), 500);
		},
	});

	if (mutation.isPending || mutation.isSuccess) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="flex justify-center text-gray-500">
					<span className="inline-block animate-pulse">
						<Leaf className="size-6 rotate-90" />
					</span>
					<span className="ml-2">Saving...</span>
				</div>
			</div>
		);
	}

	return (
		<NavigationStack>
			<StackFrame frameKey="tea:select">
				<SelectTeaFrame
					onConfirm={(tea) => {
						setForm((st) => ({ ...st, tea }));
						stackNavigator.next("parameters:input");
					}}
					onBack={goBack}
				/>
			</StackFrame>
			<StackFrame frameKey="parameters:input">
				<ParametersInput
					onBack={goBack}
					defaultTea={form.teaQuantity}
					defaultWater={form.waterVolume}
					onConfirm={(tea, water) => {
						setForm((st) => ({ ...st, teaQuantity: tea, waterVolume: water }));
						stackNavigator.next("date:select");
					}}
				/>
			</StackFrame>
			<StackFrame frameKey="date:select">
				<FrameDatePicker
					onBack={goBack}
					defaultValue={form.drankAt}
					buttonText="Save this session"
					onConfirm={(date) => {
						setForm({ ...form, drankAt: date });

						if (undefined === form.tea) {
							return;
						}

						mutation.mutate({ ...form, tea: form.tea, drankAt: date });
					}}
				/>
			</StackFrame>
		</NavigationStack>
	);
}
