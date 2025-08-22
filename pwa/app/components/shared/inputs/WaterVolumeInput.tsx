import { type ChangeEvent, useState } from "react";
import clsx from "clsx";
import { PredefinedNumberInput } from "~/components/shared/inputs/PredefinedNumberInput";

const PREDEFINED_VALUES = [
	{ value: 100, label: "100 ml" },
	{ value: 120, label: "120 ml" },
] as const;

export function WaterVolumeInput(props: { value: number | undefined; onChange: (value: number | undefined) => void }) {
	return <PredefinedNumberInput predefined={PREDEFINED_VALUES} suffix="ml" value={props.value} onChange={props.onChange} />;
}
