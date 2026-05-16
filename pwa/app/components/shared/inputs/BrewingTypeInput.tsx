import { type BrewingType, BrewingTypeEnum } from "~t/types";
import clsx from "clsx";
import { useState } from "react";
import { FireFlame, RefreshDouble, SnowFlake } from "iconoir-react";

export const TypeIcon = {
	[BrewingTypeEnum.Hot]: <FireFlame className="size-4 mb-1" />,
	[BrewingTypeEnum.Cold]: <SnowFlake className="size-4 mb-1" />,
} as const;

export const TypeLabel = {
	[BrewingTypeEnum.Hot]: "Hot brew",
	[BrewingTypeEnum.Cold]: "Cold brew",
} as const;

export function BrewingTypeInput(props: {
	value?: BrewingType;
	onChange: (value: BrewingType) => void | Promise<void>;
	readonly?: boolean;
}) {
	const [saving, setSaving] = useState<BrewingType>();

	function handleSelect(value: BrewingType) {
		if (true === props.readonly || value === props.value) {
			return;
		}

		const promise = props.onChange(value);

		if (promise) {
			setSaving(value);
			promise.finally(() => setSaving(undefined));
		}
	}

	return (
		<div className="flex bg-white rounded-xl overflow-hidden shadow-sm">
			<OptionBtn
				value={BrewingTypeEnum.Hot}
				active={BrewingTypeEnum.Hot === props.value}
				onSelect={() => handleSelect(BrewingTypeEnum.Hot)}
				loading={saving === BrewingTypeEnum.Hot}
				readonly={props.readonly}
			/>
			<OptionBtn
				value={BrewingTypeEnum.Cold}
				active={BrewingTypeEnum.Cold === props.value}
				onSelect={() => handleSelect(BrewingTypeEnum.Cold)}
				loading={saving === BrewingTypeEnum.Cold}
				readonly={props.readonly}
			/>
		</div>
	);
}

function OptionBtn(props: {
	value: BrewingType;
	active: boolean;
	onSelect: () => void;
	readonly?: boolean;
	loading?: boolean;
}) {
	const textColor = props.active ? "text-white" : "text-base-content/80";
	return (
		<button
			className={clsx(
				"flex-1 h-14 flex flex-col justify-center items-center leading-snug cursor-pointer",
				"font-medium",
				props.active ? "text-white" : "text-base-content/80",
				true !== props.readonly && !props.active && "hover:bg-green-200",
				props.active && "bg-green-700",
			)}
			onClick={() => props.onSelect()}
		>
			{true === props.loading && <RefreshDouble className={clsx("animate-spin", textColor)} />}
			{true !== props.loading && (
				<>
					{TypeIcon[props.value]}
					<span className="my-0 text-xs">{TypeLabel[props.value]}</span>
				</>
			)}
		</button>
	);
}
