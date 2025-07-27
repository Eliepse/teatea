import { StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { useMemo, useState } from "react";
import { SelectTeaFrame } from "~/components/stackFrames/SelectTeaFrame";
import { Link, useNavigate } from "react-router";
import { SelectDateFrame } from "~/components/stackFrames/SelectDateFrame";
import { NewDrinkFormFrame } from "~/components/stackFrames/NewDrinkFormFrame";
import { type FormData, NewSipContext, type SipContext } from "./add-drink.context";
import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "~/utils/api";
import { handleUIEvent } from "~/utils/function";
import { SelectTechnicFrame } from "~/components/stackFrames/SelectTechnicFrame";
import type { DrinkRaw } from "~/utils/api/normalization/drink";

export default function LogDrinkPage() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<FormData>({ drankAt: new Date() });
	const { NavigationStack, ...stackNavigator } = useNavigationStack({
		defaultFrame: { key: "form" },
		onOverBack: () => navigate(-1),
	});
	const createMutation = useMutation({
		mutationFn: async (data: FormData) => {
			if (!formData.tea || !formData.drankAt) {
				throw new Error("Invalid payload");
			}

			const response = await fetchApi<DrinkRaw>("/drinks", {
				method: "POST",
				payload: {
					drankAt: data.drankAt,
					tea: data.tea?.["@id"],
					technic: data.technic,
					teaQuantity: data.teaQuantity,
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
			submit: async (patch) => {
				if (!formData.tea || !formData.drankAt) {
					return;
				}

				setFormData({ ...formData, ...patch });
				await createMutation.mutateAsync({ ...formData, ...patch });
			},
			isSubmitting: "pending" === createMutation.status,
		}),
		[formData, createMutation.status],
	);

	return (
		<div className="bg-base-200 min-h-screen">
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
					<StackFrame frameKey="technic">
						<SelectTechnicFrame
							onSelect={(technic) => contextValue.updateForm({ technic })}
							value={formData.technic}
						/>
					</StackFrame>
					<StackFrame frameKey="done">
						<div className="h-screen flex flex-col justify-center items-center bg-[#f8e3d6]">
							<div className="max-w-xs relative z-10">
								<div className="text-2xl font-semibold text-center my-12 text-[#2a4641] ">
									Your drink has been registered
								</div>

								{createMutation.data && (
									<Link
										className="mx-auto flex btn btn-wide btn-primary mb-4"
										to={`/me/drink/${createMutation.data.id}`}
									>
										Add a tasting note
									</Link>
								)}

								<button
									className="mx-auto flex btn btn-wide btn-secondary"
									onClick={handleUIEvent(() => navigate(-1))}
								>
									Close
								</button>
							</div>
							<img
								src="/img/leaf.gif"
								alt=""
								className="fixed bottom-0 right-0 z-0 translate-x-32 translate-y-[45%] rotate-30"
							/>
						</div>
					</StackFrame>
				</NavigationStack>
			</NewSipContext.Provider>
		</div>
	);
}
