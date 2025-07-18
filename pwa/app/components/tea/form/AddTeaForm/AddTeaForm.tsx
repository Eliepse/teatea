import { createContext, useContext, useMemo, useState } from "react";
import { SelectFamily } from "./SelectFamily";
import { Paged } from "~/components/shared/paged/Paged";
import type { Origin, TeaFamily } from "~t/types";
import { SelectOrigin } from "./SelectOrigin";
import { TeaTypeForm } from "./TeaTypeForm";
import { throwNotImplemented, warnNotImplemented } from "~/utils/function";
import { fetchApi } from "~/utils/api";
import { Confirmation } from "./Confirmation";
import { useMutation } from "@tanstack/react-query";
import { wait } from "~/utils/time";
import { StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { TeaFormConfirmation } from "~/components/tea/form/AddTeaForm/TeaFormConfirmation";

const CONTEXT = createContext({
	formValue: {} as FormValue,
	updateForm: (_updater: (previous: FormValue) => FormValue) => warnNotImplemented(),
	patchForm: (_part: Partial<FormValue>) => warnNotImplemented(),
	submit: async (): Promise<unknown> => throwNotImplemented(),
	submitting: false,
});

type FormValue = {
	family?: TeaFamily;
	type?: { name: string };
	origin?: Origin;
	altitude?: number;
};

export function useTeaFormContext() {
	return useContext(CONTEXT);
}

async function submitNewTea(data: FormValue & Required<Pick<FormValue, "family" | "origin">>) {
	const response = await fetchApi("/teas", {
		method: "POST",
		payload: {
			family: data.family,
			origin: data.origin["@id"],
			type: data.type,
			altitude: data.altitude,
		},
	});

	await wait(1000);

	return await response.json();
}

export function AddTeaForm(props: { open: boolean; onClose: () => void }) {
	const [formValue, setFormValue] = useState<FormValue>({});
	const { NavigationStack, ...navStack } = useNavigationStack({
		defaultFrame: { key: "origin" },
		onOverBack: () => {
			mutation.reset();
			navStack.reset();
			setFormValue({});
			props.onClose();
		},
	});
	const mutation = useMutation({
		mutationFn: submitNewTea,
		onSuccess: (data: { id: number }) => {
			navStack.next({ key: "confirmation" });
		},
	});

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
		[formValue, mutation.status, navStack],
	);

	return (
		<NavigationStack>
			<CONTEXT.Provider value={contextValue}>
				<Paged open={props.open}>
					<StackFrame frameKey="origin">
						<SelectOrigin />
					</StackFrame>
					<StackFrame frameKey="family">
						<SelectFamily />
					</StackFrame>
					<StackFrame frameKey="typeName">
						<TeaTypeForm />
					</StackFrame>
					<StackFrame frameKey="recap">
						<TeaFormConfirmation />
					</StackFrame>
					<StackFrame frameKey="confirmation">
						<Confirmation
							state={mutation.status}
							onBack={props.onClose}
							onOk={warnNotImplemented}
							error={mutation.error?.message}
						/>
					</StackFrame>
				</Paged>
			</CONTEXT.Provider>
		</NavigationStack>
	);
}
