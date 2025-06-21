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

type Step = "type" | "origin" | "other" | "confirmation";

const CONTEXT = createContext({
	step: "type" as Step,
	goTo: (_step: Step) => warnNotImplemented(),
	close: (): void => warnNotImplemented(),
	back: (): void => warnNotImplemented(),
	formValue: {} as FormValue,
	updateForm: (_updater: (previous: FormValue) => FormValue) => warnNotImplemented(),
	patchForm: (_part: Partial<FormValue>) => warnNotImplemented(),
	submit: async (): Promise<unknown> => throwNotImplemented(),
	submitting: false,
});

type FormValue = {
	family?: TeaFamily;
	type?: TeaType;
	origin?: Origin,
	name?: string,
	altitude?: number,
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
			altitude: data.altitude
		})
	});

	await wait(1000);

	return await response.json();
}

export function AddTeaForm(props: { open: boolean; onClose: () => void }) {
	const [formValue, setFormValue] = useState<FormValue>({});
	const [navigationStack, setNavigationStack] = useState<Step[]>(["type"]);
	const mutation = useMutation({
		mutationFn: submitNewTea,
		onSuccess: (data: { id: number }) => {
			console.debug(data);
			setNavigationStack(stack => [...stack, "confirmation"]);
		}
	});

	const close = useCallback(() => {
		setFormValue({});
		setNavigationStack(["type"]);
		mutation.reset();
		props.onClose();
	}, [props.onClose]);

	const contextValue = useMemo(
		() => ({
			step: navigationStack.slice(-1)[0],
			goTo: (step: Step) => setNavigationStack(stack => [...stack, step]),
			close,
			back() {
				if (1 >= navigationStack.length) {
					close();
					return;
				}

				setNavigationStack(stack => stack.slice(0, -1));
			},
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
		[close, navigationStack, formValue, mutation.status]
	);

	return (
		<CONTEXT.Provider value={contextValue}>
			<Paged open={props.open}>
				{"type" === contextValue.step && <SelectType />}
				{"origin" === contextValue.step && <SelectOrigin />}
				{"other" === contextValue.step && <OtherTeaInfo />}
				{"confirmation" === contextValue.step &&
					<Confirmation
						state={mutation.status}
						onBack={contextValue.close}
						onOk={warnNotImplemented}
						error={mutation.error?.message}
					/>}
			</Paged>
		</CONTEXT.Provider>
	);
}
