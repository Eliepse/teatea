import { createContext, useContext, useMemo, useState } from "react";
import { SelectFamily } from "../family/SelectFamily";
import type { Cultivar, Origin, RoastLevel, Tea, TeaFamily, TeaType } from "~t/types";
import { SelectOrigin } from "../origin/SelectOrigin";
import { warnNotImplemented } from "~/utils/function";
import { postApi } from "~/utils/api";
import { useMutation } from "@tanstack/react-query";
import { StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { TeaFormConfirmation } from "~/components/tea/create/TeaFormConfirmation";
import { SelectType } from "~/components/tea_type/SelectType";
import { AskName } from "~/components/tea/create/AskName";
import { useAlert } from "~/components/shared/modal/AlertManager";
import { SelectCultivar } from "~/components/cultivar/SelectCultivar";
import { useNavigate } from "react-router";

const CONTEXT = createContext({
	formValue: {} as FormValue,
	patchForm: (_part: Partial<FormValue>) => warnNotImplemented(),
	submitting: false,
});

type FormValue = {
	family?: TeaFamily;
	type?: TeaType | { name: string; isPDO: boolean };
	origin?: Origin;
	cultivar?: Cultivar;
	year?: number;
	roast?: RoastLevel;
};

export function useTeaFormContext() {
	return useContext(CONTEXT);
}

async function submitNewTea(data: FormValue & Required<Pick<FormValue, "family" | "origin">>) {
	const path = data.type && "id" in data.type ? `/tea_types/${data.type.id}/teas` : "/teas";

	const response = await postApi<Tea>(path, {
		...data,
		origin: data.origin ? data.origin["@id"] : undefined,
		type: !data.type || "id" in data.type ? undefined : data.type,
		cultivar: data.cultivar?.["@id"],
	});

	return await response.json();
}

export function CreateTeaFlow(props: { onClose: () => void }) {
	const [formValue, setFormValue] = useState<FormValue>({});
	const navigate = useNavigate();
	const alert = useAlert();
	const { NavigationStack, ...navStack } = useNavigationStack({ defaultFrame: "origin:select" });

	function closeFlow() {
		mutation.reset();
		navStack.reset();
		setFormValue({});
		props.onClose();
	}

	function goBack() {
		if (1 === navStack.stack.length) {
			closeFlow();
			return;
		}

		navStack.back();
	}

	const mutation = useMutation({
		mutationFn: submitNewTea,
		onSuccess: (data: Tea) => {
			navigate(`/tea/${data.id}`);
		},
		onError: (e) => {
			alert({ title: "Couldn't add this tea", body: e.message });
		},
	});

	function submit() {
		// Make sure minimum info are filled in
		if (!formValue.family) {
			throw new Error("Incomplete form");
		}

		// Submit to the API
		mutation.mutate(formValue as FormValue & Required<Pick<FormValue, "family" | "origin">>);
	}

	const contextValue = useMemo(
		() => ({
			formValue,
			patchForm: (part: Partial<FormValue>) => setFormValue((form) => ({ ...form, ...part })),
			submitting: "pending" === mutation.status,
		}),
		[formValue, mutation.status],
	);

	return (
		<NavigationStack>
			<CONTEXT.Provider value={contextValue}>
				<StackFrame frameKey="origin:select">
					<SelectOrigin
						onBack={goBack}
						onSelect={(origin) => {
							contextValue.patchForm({ origin });
							navStack.next("family:select");
						}}
						defaultOriginPath={formValue.origin?.path}
						allowCreation
						allowSkip
					/>
				</StackFrame>
				<StackFrame frameKey="family:select">
					<SelectFamily
						onBack={goBack}
						onSelect={(family) => {
							contextValue.patchForm({ family });
							navStack.next("select:type");
						}}
						defaultValue={formValue.family}
					/>
				</StackFrame>
				<StackFrame frameKey="select:type">
					<SelectType
						onBack={goBack}
						onSkip={() => {
							contextValue.patchForm({ type: undefined });
							navStack.next("select:cultivar");
						}}
						onCreate={() => {
							if (formValue.type && "@id" in formValue.type) {
								contextValue.patchForm({ type: undefined });
							}

							navStack.next("name:ask");
						}}
						onSelect={(type) => {
							if (undefined === type) {
								if (formValue.type && "@id" in formValue.type) {
									contextValue.patchForm({ type: undefined });
								}

								navStack.next("select:cultivar");
							} else {
								contextValue.patchForm({ type });
								navStack.next("select:cultivar");
							}
						}}
						defaultValue={formValue.type && "id" in formValue.type ? formValue.type : undefined}
						filters={{ family: formValue.family, originPath: formValue.origin?.path }}
					/>
				</StackFrame>
				<StackFrame frameKey="select:cultivar">
					<SelectCultivar
						onBack={goBack}
						onSkip={() => {
							contextValue.patchForm({ cultivar: undefined });
							navStack.next("recap");
						}}
						onSelect={(cultivar) => {
							contextValue.patchForm({ cultivar });
							navStack.next("recap");
						}}
						defaultValue={formValue.cultivar && "id" in formValue.cultivar ? formValue.cultivar : undefined}
						allowCreate
					/>
				</StackFrame>
				<StackFrame frameKey="name:ask">
					<AskName
						onBack={goBack}
						onConfirm={(name) => {
							if (undefined === name) {
								setFormValue((st) => ({ ...st, type: undefined }));
								navStack.next("select:cultivar");
								return;
							}

							setFormValue((st) => ({ ...st, type: { name, isPDO: st.type?.isPDO ?? false } }));
							navStack.next("select:cultivar");
						}}
						defaultValue={formValue.type?.name}
					/>
				</StackFrame>
				<StackFrame frameKey="recap">
					<TeaFormConfirmation
						onBack={goBack}
						values={formValue}
						onConfirm={submit}
						onChange={setFormValue}
					/>
				</StackFrame>
			</CONTEXT.Provider>
		</NavigationStack>
	);
}
