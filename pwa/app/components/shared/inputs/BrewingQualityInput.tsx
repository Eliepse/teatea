import { type BrewingQuality, BrewingQualityEnum } from "~t/types";
import clsx from "clsx";
import { useState } from "react";
import { EmojiPuzzled, EmojiSad, EmojiSatisfied, RefreshDouble } from "iconoir-react";

export const QualityIcon = {
	[BrewingQualityEnum.Good]: <EmojiSatisfied className="size-4 mb-1" />,
	[BrewingQualityEnum.Improvable]: <EmojiPuzzled className="size-4 mb-1" />,
	[BrewingQualityEnum.Bad]: <EmojiSad className="size-4 mb-1" />,
} as const;

export const QualityLabel = {
	[BrewingQualityEnum.Bad]: "Bad",
	[BrewingQualityEnum.Improvable]: "Improvable",
	[BrewingQualityEnum.Good]: "Good",
} as const;

export function BrewingQualityInput(props: {
	value?: BrewingQuality;
	onChange: (value: BrewingQuality) => void | Promise<void>;
	readonly?: boolean;
}) {
	const [saving, setSaving] = useState<BrewingQuality>();

	function handleSelect(value: BrewingQuality) {
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
					{QualityIcon[props.value]}
					<span className="my-0 text-xs">{QualityLabel[props.value]}</span>
				</>
			)}
		</button>
	);
}
