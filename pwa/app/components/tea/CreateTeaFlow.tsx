import { createContext, useContext, useMemo, useState } from "react";
import { SelectFamily } from "../family/SelectFamily";
import type { Cultivar, Origin, Tea, TeaFamily, TeaType } from "~t/types";
import { SelectOrigin } from "../origin/SelectOrigin";
import { warnNotImplemented } from "~/utils/function";
import { fetchApi } from "~/utils/api";
import { Confirmation } from "./create/Confirmation";
import { useMutation } from "@tanstack/react-query";
import { StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { TeaFormConfirmation } from "~/components/tea/create/TeaFormConfirmation";
import { SelectType } from "~/components/tea_type/SelectType";
import { AskName } from "~/components/tea/create/AskName";
import { useAlert } from "~/components/shared/modal/AlertManager";
import { SelectCultivar } from "~/components/cultivar/SelectCultivar";

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
	altitude?: number;
	appellation?: boolean;
};

export function useTeaFormContext() {
	return useContext(CONTEXT);
}

async function submitNewTea(data: FormValue & Required<Pick<FormValue, "family" | "origin">>) {
	const path = data.type && "id" in data.type ? `/tea_types/${data.type.id}/teas` : "/teas";

	const response = await fetchApi<Tea>(path, {
		method: "POST",
		payload: {
			family: data.family,
			origin: data.origin["@id"],
			type: !data.type || "id" in data.type ? undefined : data.type,
			altitude: data.altitude,
			isAppellation: data.appellation,
			cultivar: data.cultivar?.["@id"],
		},
	});

	return await response.json();
}

export function CreateTeaFlow(props: { onClose: (newTea?: Tea) => void; onSelect?: (tea: Tea) => void }) {
	const asSelector = undefined !== props.onSelect;
	const [formValue, setFormValue] = useState<FormValue>({});
	const [createdTea, setCreatedTea] = useState<Tea | undefined>();
	const alert = useAlert();
	const { NavigationStack, ...navStack } = useNavigationStack({
		defaultFrame: { key: "origin:select" },
		onOverBack: closeFlow,
	});

	function closeFlow() {
		mutation.reset();
		navStack.reset();
		setFormValue({});
		props.onClose();
	}

	function selectTea() {
		if (undefined === props.onSelect || undefined === createdTea) {
			return;
		}

		props.onSelect(createdTea);
		closeFlow();
	}

	const mutation = useMutation({
		mutationFn: submitNewTea,
		onSuccess: (data: Tea) => {
			setCreatedTea(data);
			navStack.next({ key: "confirmation" });
		},
		onError: (e) => {
			alert({ title: "Couldn't add this tea", body: e.message });
		},
	});

	function submit() {
		// Make sure minimum info are filled in
		if (!formValue.origin || !formValue.family) {
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
						onBack={() => navStack.back()}
						onSelect={(origin) => {
							contextValue.patchForm({ origin });
							navStack.next({ key: "family:select" });
						}}
						defaultValue={formValue.origin}
					/>
				</StackFrame>
				<StackFrame frameKey="family:select">
					<SelectFamily
						onBack={() => navStack.back()}
						onSelect={(family) => {
							contextValue.patchForm({ family });
							navStack.next({ key: "select:type" });
						}}
						defaultValue={formValue.family}
					/>
				</StackFrame>
				<StackFrame frameKey="select:type">
					<SelectType
						onBack={() => navStack.back()}
						onSkip={() => {
							contextValue.patchForm({ type: undefined });
							navStack.next({ key: "select:cultivar" });
						}}
						onCreate={() => {
							if (formValue.type && "@id" in formValue.type) {
								contextValue.patchForm({ type: undefined });
							}

							navStack.next({ key: "select:cultivar" });
						}}
						onSelect={(type) => {
							if (undefined === type) {
								if (formValue.type && "@id" in formValue.type) {
									contextValue.patchForm({ type: undefined });
								}

								navStack.next({ key: "select:cultivar" });
							} else {
								contextValue.patchForm({ type });
								navStack.next({ key: "select:cultivar" });
							}
						}}
						defaultValue={formValue.type && "id" in formValue.type ? formValue.type : undefined}
						filters={{ family: formValue.family, originPath: formValue.origin?.path }}
					/>
				</StackFrame>
				<StackFrame frameKey="select:cultivar">
					<SelectCultivar
						onBack={() => navStack.back()}
						onSkip={() => {
							contextValue.patchForm({ cultivar: undefined });
							navStack.next({ key: "recap" });
						}}
						onCreate={() => {
							if (formValue.cultivar && "@id" in formValue.cultivar) {
								contextValue.patchForm({ cultivar: undefined });
							}

							navStack.next({ key: "name:ask" });
						}}
						onSelect={(cultivar) => {
							if (undefined === cultivar) {
								if (formValue.cultivar && "@id" in formValue.cultivar) {
									contextValue.patchForm({ cultivar: undefined });
								}

								navStack.next({ key: "name:ask" });
							} else {
								contextValue.patchForm({ cultivar });
								navStack.next({ key: "recap" });
							}
						}}
						defaultValue={formValue.cultivar && "id" in formValue.cultivar ? formValue.cultivar : undefined}
					/>
				</StackFrame>
				<StackFrame frameKey="name:ask">
					<AskName
						onBack={() => navStack.back()}
						onConfirm={(name) => {
							if (undefined === name) {
								setFormValue((st) => ({ ...st, type: undefined }));
								navStack.next({ key: "recap" });
								return;
							}
							setFormValue((st) => ({ ...st, type: { name, isPDO: st.type?.isPDO ?? false } }));
							navStack.next({ key: "recap" });
						}}
						defaultValue={formValue.type?.name}
					/>
				</StackFrame>
				<StackFrame frameKey="recap">
					<TeaFormConfirmation onBack={() => navStack.back()} values={formValue} onConfirm={submit} />
				</StackFrame>
				<StackFrame frameKey="confirmation">
					<Confirmation
						state={mutation.status}
						onBack={props.onClose}
						onOk={asSelector ? selectTea : undefined}
						okText={asSelector ? "Select this tea" : undefined}
						error={mutation.error?.message}
					/>
				</StackFrame>
			</CONTEXT.Provider>
		</NavigationStack>
	);
}
