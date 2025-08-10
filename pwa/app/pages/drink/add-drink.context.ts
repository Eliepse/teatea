import type { Tea } from "~t/types";
import { createContext, useContext } from "react";
import { warnNotImplemented } from "~/utils/function";
import type { TechnicType } from "~/components/shared/BrewingTechnic";

export type FormData = {
	tea?: Tea;
	teaQuantity?: number;
	waterVolume?: number;
	drankAt?: Date;
	technic?: TechnicType | null;
};

export type SipContext = {
	updateForm: (part: Partial<FormData>) => void;
	formData: FormData;
	submit: (patch?: Partial<FormData>) => Promise<void>;
	isSubmitting: boolean;
};

export const NewSipContext = createContext<SipContext>({
	updateForm: (part: Partial<FormData>) => warnNotImplemented(),
	formData: {} satisfies FormData,
	submit: async () => warnNotImplemented(),
	isSubmitting: false,
});

export function useNewSipContext() {
	return useContext(NewSipContext);
}
