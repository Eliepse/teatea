import { useState } from "react";
import type { Tea } from "~t/types";
import { brewingTechnic, type TechnicType } from "~/components/shared/BrewingTechnic";
import { StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { SelectTeaFrame } from "~/components/stackFrames/SelectTeaFrame";
import { FrameSelect } from "~/components/shared/frame/FrameSelect";
import { ParametersInput } from "~/components/drink/create/ParametersInput";
import { FrameDatePicker } from "~/components/shared/frame/FrameDatePicker";
import { useMutation } from "@tanstack/react-query";
import Leaf from "~/components/icons/leaf";
import { fetchApi } from "~/utils/api";
import type { DrinkRaw } from "~/utils/api/normalization/drink";
import { formatISO } from "date-fns";
import { useNavigate } from "react-router";
import { useAlert } from "~/components/shared/modal/AlertManager";

export type DrinkForm = {
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

export function CreateDrinkFlow(props: { onBack: () => void }) {
	const navigate = useNavigate();
	const alert = useAlert();
	const [form, setForm] = useState<DrinkForm>({ drankAt: new Date() });
	const { NavigationStack, ...stackNavigator } = useNavigationStack({
		defaultFrame: { key: "tea:select" },
		onOverBack: props.onBack,
	});

	const mutation = useMutation({
		mutationFn: async (data: DrinkForm & Required<Pick<DrinkForm, "tea">>) => {
			const response = await fetchApi<DrinkRaw>("/drinks", {
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
			setTimeout(() => navigate(`/me/drink/${data.id}`), 500);
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
						stackNavigator.next({ key: "parameters:input" });
					}}
					onBack={stackNavigator.back}
				/>
			</StackFrame>
			{/*<StackFrame frameKey="technic:select">*/}
			{/*	<FrameSelect*/}
			{/*		items={technicItems}*/}
			{/*		defaultValue={form.technic ?? undefined}*/}
			{/*		onBack={stackNavigator.back}*/}
			{/*		buttonText="Next"*/}
			{/*		onConfirm={(technic) => {*/}
			{/*			setForm((st) => ({ ...st, technic }));*/}
			{/*			stackNavigator.next({ key: "parameters:input" });*/}
			{/*		}}*/}
			{/*	/>*/}
			{/*</StackFrame>*/}
			<StackFrame frameKey="parameters:input">
				<ParametersInput
					onBack={stackNavigator.back}
					defaultTea={form.teaQuantity}
					defaultWater={form.waterVolume}
					onConfirm={(tea, water) => {
						setForm((st) => ({ ...st, teaQuantity: tea, waterVolume: water }));
						stackNavigator.next({ key: "date:select" });
					}}
				/>
			</StackFrame>
			<StackFrame frameKey="date:select">
				<FrameDatePicker
					onBack={stackNavigator.back}
					defaultValue={form.drankAt}
					buttonText="Save this drink"
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
