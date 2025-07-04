import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { SelectType } from "./SelectType";
import { Paged } from "~/components/shared/paged/Paged";
import type { Origin, TeaFamily, TeaType } from "~t/types";
import { SelectOrigin } from "./SelectOrigin";
import { OtherTeaInfo } from "~/components/tea/form/AddTeaForm/OtherTeaInfo";
import { throwNotImplemented, warnNotImplemented } from "~/utils/function";
import { fetchApi } from "~/utils/api";
import { Confirmation } from "~/components/tea/form/AddTeaForm/Confirmation";
import { useMutation } from "@tanstack/react-query";
import { wait } from "~/utils/time";
import { NavigationStack, StackFrame, useStackNavigator } from "~/utils/navigation/useNavigationStack";

const CONTEXT = createContext({
	formValue: {} as FormValue,
	updateForm: (_updater: (previous: FormValue) => FormValue) => warnNotImplemented(),
	patchForm: (_part: Partial<FormValue>) => warnNotImplemented(),
	submit: async (): Promise<unknown> => throwNotImplemented(),
	submitting: false,
});

type FormValue = {
	family?: TeaFamily;
	type?: TeaType;
	origin?: Origin;
	name?: string;
	altitude?: number;
};

export function useTeaFormContext() {
	return useContext(CONTEXT);
}

async function submitNewTea(data: FormValue & Required<Pick<FormValue, "family" | "origin">>) {
	const response = await fetchApi("/teas", {
		method: "POST",
		body: JSON.stringify({
			family: data.family,
			origin: data.origin["@id"],
			type: data.type ? data.type["@id"] : null,
			name: data.name,
			altitude: data.altitude,
		}),
	});

	await wait(1000);

	return await response.json();
}

export function AddTeaForm(props: { open: boolean; onClose: () => void }) {
	const [formValue, setFormValue] = useState<FormValue>({});
	const navStack = useStackNavigator();
	const mutation = useMutation({
		mutationFn: submitNewTea,
		onSuccess: (data: { id: number }) => {
			navStack.next({ key: "confirmation" });
		},
	});

	const close = useCallback(() => {
		setFormValue({});
		navStack.reset();
		mutation.reset();
		props.onClose();
	}, [props.onClose, navStack.reset]);

	const contextValue = useMemo(
		() => ({
			formValue,
			updateForm: (updater: (previous: FormValue) => FormValue) => setFormValue(updater),
			patchForm: (part: Partial<FormValue>) => setFormValue((form) => ({ ...form, ...part })),
			submit: async () => {
				// Make sure minimum info are filled in
				if (!formValue.origin || !formValue.family) {
					throw new Error("Incomplete form");
				}

				// Submit to the API
				mutation.mutate(formValue);
			},
			submitting: "pending" === mutation.status,
		}),
		[close, formValue, mutation.status, navStack],
	);

	return (
		<CONTEXT.Provider value={contextValue}>
			<NavigationStack defaultFrame={{ key: "type" }}>
				<Paged open={props.open}>
					<StackFrame frameKey="type">
						<SelectType />
					</StackFrame>
					<StackFrame frameKey="origin">
						<SelectOrigin />
					</StackFrame>
					<StackFrame frameKey="other">
						<OtherTeaInfo />
					</StackFrame>
					<StackFrame frameKey="confirmation">
						<Confirmation
							state={mutation.status}
							onBack={close}
							onOk={warnNotImplemented}
							error={mutation.error?.message}
						/>
					</StackFrame>
				</Paged>
			</NavigationStack>
		</CONTEXT.Provider>
	);
}
