import { PredefinedNumberInput } from "~/components/shared/inputs/PredefinedNumberInput";

const PREDEFINED_VALUES = [
	{ value: 3, label: "3 g" },
	{ value: 5, label: "5 g" },
	{ value: 7, label: "7 g" },
] as const;

export function TeaQuantityInput(props: { value: number | undefined; onChange: (value: number | undefined) => void }) {
	return <PredefinedNumberInput predefined={PREDEFINED_VALUES} suffix="g" value={props.value} onChange={props.onChange} />;
}
