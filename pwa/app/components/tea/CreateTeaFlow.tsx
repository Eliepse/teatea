import { createContext, useContext, useMemo, useState } from "react";
import { SelectFamily } from "../family/SelectFamily";
import type { Origin, TeaFamily } from "~t/types";
import { SelectOrigin } from "../origin/SelectOrigin";
import { throwNotImplemented, warnNotImplemented } from "~/utils/function";
import { fetchApi } from "~/utils/api";
import { Confirmation } from "./create/Confirmation";
import { useMutation } from "@tanstack/react-query";
import { StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { TeaFormConfirmation } from "~/components/tea/create/TeaFormConfirmation";
import { SelectType } from "~/components/tea/create/SelectType";

const CONTEXT = createContext({
	formValue: {} as FormValue,
	patchForm: (_part: Partial<FormValue>) => warnNotImplemented(),
	submit: async (): Promise<unknown> => throwNotImplemented(),
	submitting: false,
});

type FormValue = {
	family?: TeaFamily;
	type?: { name: string };
	origin?: Origin;
	altitude?: number;
	appellation?: boolean;
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
			isAppellation: data.appellation,
		},
	});

	return await response.json();
}

export function CreateTeaFlow(props: { onClose: () => void }) {
	const [formValue, setFormValue] = useState<FormValue>({});
	const { NavigationStack, ...navStack } = useNavigationStack({
		defaultFrame: { key: "origin:select" },
		onOverBack: () => {
			mutation.reset();
			navStack.reset();
			setFormValue({});
			props.onClose();
		},
	});
	const mutation = useMutation({
		mutationFn: submitNewTea,
		onSuccess: () => {
			navStack.next({ key: "confirmation" });
		},
	});

	const contextValue = useMemo(
		() => ({
			formValue,
			patchForm: (part: Partial<FormValue>) => setFormValue((form) => ({ ...form, ...part })),
			submit: async () => {
				// Make sure minimum info are filled in
				if (!formValue.origin || !formValue.family) {
					throw new Error("Incomplete form");
				}

				// Submit to the API
				mutation.mutate(formValue as FormValue & Required<Pick<FormValue, "family" | "origin">>);
			},
			submitting: "pending" === mutation.status,
		}),
		[formValue, mutation.status, navStack],
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
					<SelectType />
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
			</CONTEXT.Provider>
		</NavigationStack>
	);
}
