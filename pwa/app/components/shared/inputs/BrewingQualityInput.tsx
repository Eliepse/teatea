import { type BrewingQuality, BrewingQualityEnum } from "~t/types";
import clsx from "clsx";
import { useState } from "react";
import { RefreshDouble } from "iconoir-react";

export const QualityIcon = {
	[BrewingQualityEnum.Bad]: "☹️",
	[BrewingQualityEnum.Improvable]: "😐",
	[BrewingQualityEnum.Correct]: "🙂",
	[BrewingQualityEnum.Good]: "😀",
} as const;

export const QualityLabel = {
	[BrewingQualityEnum.Bad]: "Bad",
	[BrewingQualityEnum.Improvable]: "Improvable",
	[BrewingQualityEnum.Correct]: "Correct",
	[BrewingQualityEnum.Good]: "Good",
} as const;

export function BrewingQualityInput(props: {
	value?: BrewingQuality;
	onChange: (value: BrewingQuality) => void|Promise<void>;
	readonly?: boolean;
}) {
	const [saving, setSaving] = useState<BrewingQuality>();

	function handleSelect(value: BrewingQuality) {
		if (true === props.readonly || value === props.value) {
			return;
		}

		const promise = props.onChange(value);

		if(promise) {
			setSaving(value);
			promise.finally(() => setSaving(undefined));
		}
	}

	return (
		<div className="flex rounded-md bg-base-200 overflow-hidden">
			<OptionBtn
				value={BrewingQualityEnum.Bad}
				active={BrewingQualityEnum.Bad === props.value}
				onSelect={() => handleSelect(BrewingQualityEnum.Bad)}
				loading={saving === BrewingQualityEnum.Bad}
				readonly={props.readonly}
			/>
			<OptionBtn
				value={BrewingQualityEnum.Improvable}
				active={BrewingQualityEnum.Improvable === props.value}
				onSelect={() => handleSelect(BrewingQualityEnum.Improvable)}
				loading={saving === BrewingQualityEnum.Improvable}
				readonly={props.readonly}
			/>
			<OptionBtn
				value={BrewingQualityEnum.Correct}
				active={BrewingQualityEnum.Correct === props.value}
				onSelect={() => handleSelect(BrewingQualityEnum.Correct)}
				loading={saving === BrewingQualityEnum.Correct}
				readonly={props.readonly}
			/>
			<OptionBtn
				value={BrewingQualityEnum.Good}
				active={BrewingQualityEnum.Good === props.value}
				onSelect={() => handleSelect(BrewingQualityEnum.Good)}
				loading={saving === BrewingQualityEnum.Good}
				readonly={props.readonly}
			/>
		</div>
	);
}

function OptionBtn(props: {
	value: BrewingQuality;
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
				true !== props.readonly && !props.active && "hover:bg-base-300",
				props.active && "bg-primary",
			)}
			onClick={() => props.onSelect()}
		>
			{true === props.loading && <RefreshDouble className={clsx("animate-spin", textColor)} />}
			{true !== props.loading && (
				<>
					{QualityIcon[props.value]}
					<span className={clsx("my-0 text-xs", textColor)}>{QualityLabel[props.value]}</span>
				</>
			)}
		</button>
	);
}
