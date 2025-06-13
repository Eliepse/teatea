import { createContext, useContext, useMemo, useState } from "react";
import { Step1 } from "./steps/Step1";
import { Paged } from "../shared/paged/Paged";
import type { Tea, Teaware } from "~t/types";
import { Step2 } from "./steps/Step2";
import { Step3 } from "./steps/Step3";
import type { Volume, Weight } from "~/utils/value-objects/units";

const context = createContext({
	step: 0,
	goTo(_step: number) {},
	close() {},
	formValue: {} as FormValue,
	updateForm(_updater: (previous: FormValue) => FormValue) {},
});

type FormValue = {
	tea?: Tea;
	teaware?: Teaware;
	teaQuantity?: Weight;
};

export function useMultiStepForm() {
	return useContext(context);
}

export function BrewMultiStepForm(props: { open: boolean; onClose: () => void }) {
	const { onClose } = props;
	const [step, setStep] = useState(1);
	const [formValue, setFormValue] = useState<FormValue>({});

	const contextValue = useMemo(
		() => ({
			step,
			goTo: (step: number) => setStep(step),
			close: () => onClose(),
			formValue,
			updateForm: (updater: (previous: FormValue) => FormValue) => setFormValue(updater),
		}),
		[onClose, step, formValue],
	);

	return (
		<Paged open={props.open}>
			<context.Provider value={contextValue}>{1 === step && <Step1 />}</context.Provider>
			<context.Provider value={contextValue}>{2 === step && <Step2 />}</context.Provider>
			<context.Provider value={contextValue}>{3 === step && <Step3 />}</context.Provider>
		</Paged>
	);
}
