import { NavigationStack, StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { useMemo, useState } from "react";
import { SelectTeaFrame } from "~/components/stackFrames/SelectTeaFrame";
import { useNavigate } from "react-router";
import { SelectDateFrame } from "~/components/stackFrames/SelectDateFrame";
import { NewDrinkFormFrame } from "~/components/stackFrames/NewDrinkFormFrame";
import { type FormData, NewSipContext, type SipContext } from "./add-drink.context";
import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "~/utils/api";
import { Confirmation } from "~/components/tea/form/AddTeaForm/Confirmation";

export default function LogDrinkPage() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<FormData>({ drankAt: new Date() });
	const { NavigationStack, ...stackNavigator } = useNavigationStack({
		defaultFrame: { key: "form" },
		onOverBack: () => navigate(-1),
	});
	const createSipMutation = useMutation({
		mutationFn: async (data: FormData) => {
			if (!formData.tea || !formData.drankAt) {
				throw new Error("Invalid payload");
			}

			const response = await fetchApi("/drinks", {
				method: "POST",
				payload: {
					drankAt: data.drankAt,
					tea: data.tea?.["@id"],
				},
			});

			return await response.json();
		},
		onSuccess: (data) => {
			stackNavigator.next({ key: "done", data });
		},
	});

	function reset() {
		setFormData({});
		stackNavigator.reset();
	}

	const contextValue = useMemo<SipContext>(
		() => ({
			updateForm: (part: Partial<FormData>) => setFormData((f) => ({ ...f, ...part })),
			formData,
			submit: async () => {
				if (!formData.tea || !formData.drankAt) {
					return;
				}

				await createSipMutation.mutateAsync(formData);
			},
			isSubmitting: "pending" === createSipMutation.status,
		}),
		[formData, createSipMutation.status],
	);

	return (
		<NewSipContext.Provider value={contextValue}>
			<NavigationStack>
				<StackFrame frameKey="form">
					<NewDrinkFormFrame />
				</StackFrame>
				<StackFrame frameKey="date">
					<SelectDateFrame
						mode="single"
						selected={contextValue.formData.drankAt}
						onSelect={(v) => contextValue.updateForm({ drankAt: v })}
						disabled={{ after: new Date() }}
						showOutsideDays
						endMonth={new Date()}
						required
					/>
				</StackFrame>
				<StackFrame frameKey="tea">
					<SelectTeaFrame onSelect={(tea) => contextValue.updateForm({ tea })} value={formData.tea} />
				</StackFrame>
				<StackFrame frameKey="done">
					<Confirmation
						onBack={reset}
						onOk={() => alert("yeah")}
						state={createSipMutation.status}
						error={createSipMutation.error?.message}
					/>
				</StackFrame>
			</NavigationStack>
		</NewSipContext.Provider>
	);
}
