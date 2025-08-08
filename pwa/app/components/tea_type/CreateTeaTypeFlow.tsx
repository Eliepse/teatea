import { createContext, useContext, useMemo, useState } from "react";
import { SelectFamily } from "./create/SelectFamily";
import type { Origin, TeaFamily, TeaType } from "~t/types";
import { SelectOrigin } from "../origin/SelectOrigin";
import { handleUIEvent, throwNotImplemented, warnNotImplemented } from "~/utils/function";
import { fetchApi } from "~/utils/api";
import { useMutation } from "@tanstack/react-query";
import { StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import { IsProtectedOrigin } from "~/components/tea_type/create/IsProtectedOrigin";
import { AskName } from "~/components/tea_type/create/AskName";
import { ConfirmNewTeaType } from "~/components/tea_type/create/ConfirmNewTeaType";
import { useAlert } from "~/components/shared/modal/AlertManager";
import { ApiError } from "~/api/errors/ApiError";

const CONTEXT = createContext({
	formValue: {} as FormValue,
	patchForm: (_part: Partial<FormValue>) => warnNotImplemented(),
	submit: async (): Promise<unknown> => throwNotImplemented(),
	submitting: false,
});

type FormValue = {
	family?: TeaFamily;
	name?: string;
	origin?: Origin;
	isProtectedOrigin?: boolean;
};

export function useTeaTypeFormContext() {
	return useContext(CONTEXT);
}

async function submitNewTeaType(data: Required<FormValue>) {
	const response = await fetchApi<TeaType>("/tea_types", {
		method: "POST",
		payload: {
			family: data.family,
			origin: data.origin["@id"],
			name: data.name,
			isProtectedOrigin: data.isProtectedOrigin,
		},
	});

	return await response.json();
}

export function CreateTeaTypeFlow(props: { onClose: () => void }) {
	const alert = useAlert();
	const [formValue, setFormValue] = useState<FormValue>({});

	const { NavigationStack, ...navStack } = useNavigationStack({
		defaultFrame: { key: "origin:select" },
		onOverBack: close,
	});

	const mutation = useMutation({
		mutationFn: submitNewTeaType,
		onSuccess: () => navStack.next({ key: "confirmation" }),
		onError: (e) => {
			if (e instanceof ApiError) {
				alert({
					title: "Could not submit the type",
					body: e instanceof ApiError ? e.message : null,
				});
				return;
			}

			alert({ body: "Could not submit the type" });
		},
	});

	function close() {
		mutation.reset();
		navStack.reset();
		setFormValue({});
		props.onClose();
	}

	const contextValue = useMemo(
		() => ({
			formValue,
			patchForm: (part: Partial<FormValue>) => setFormValue((form) => ({ ...form, ...part })),
			submit: async () => {
				// Make sure minimum info are filled in
				if (!formValue.origin || !formValue.family || !(formValue.name ?? "").trim().length) {
					throw new Error("Incomplete form");
				}

				mutation.mutate(formValue as Required<FormValue>);
			},
			submitting: "pending" === mutation.status,
		}),
		[formValue, mutation.status, navStack],
	);

	return (
		<CONTEXT.Provider value={contextValue}>
			<NavigationStack>
				<StackFrame frameKey="origin:select">
					<SelectOrigin />
				</StackFrame>
				<StackFrame frameKey="pdo:ask">
					<IsProtectedOrigin />
				</StackFrame>
				<StackFrame frameKey="family:select">
					<SelectFamily />
				</StackFrame>
				<StackFrame frameKey="name:ask">
					<AskName />
				</StackFrame>
				<StackFrame frameKey="recap:confirm">
					<ConfirmNewTeaType />
				</StackFrame>
				<StackFrame frameKey="confirmation">
					<div className="flex flex-col justify-center items-center h-full p-4 text-center">
						<p className="text-xl mb-8">New type submitted</p>

						<button className="btn btn-wide btn-primary" onClick={handleUIEvent(close)}>
							Great!
						</button>
					</div>
				</StackFrame>
			</NavigationStack>
		</CONTEXT.Provider>
	);
}
