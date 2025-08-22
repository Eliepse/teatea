import { type ChangeEvent, useState } from "react";
import clsx from "clsx";
import { XCircleIcon } from "@heroicons/react/16/solid";
import { handleUIEvent } from "~/utils/function";

type Item<TValue> = { label: string; value: TValue };

export function PredefinedNumberInput<TPredefined extends number>(props: {
	predefined: ReadonlyArray<Item<TPredefined>>;
	value: number | undefined;
	onChange: (value: number | undefined) => void;
	suffix?: string;
	noCustom?: boolean;
}) {
	const canCustom = true !== props.noCustom;
	const [isCustom, setIsCustom] = useState(
		canCustom && undefined !== props.value && false === props.predefined.some((i) => i.value === props.value),
	);

	function handleCustomChange(e: ChangeEvent<HTMLInputElement>) {
		const value = Math.max(parseInt(e.currentTarget.value.trim()), 0);
		props.onChange(0 !== value ? value : undefined);
	}

	function handlePredefinedChange(predefinedValue: (typeof props.predefined)[number]) {
		return (e: ChangeEvent<HTMLInputElement>) => {
			e.stopPropagation();

			if (e.currentTarget.checked) {
				props.onChange(predefinedValue.value);
			}
		};
	}

	if (canCustom && isCustom) {
		return (
			<label className="input w-full pr-0">
				<input type="number" min={1} step={1} value={props.value ?? ""} onChange={handleCustomChange} />
				{!!props.suffix && <span className="label">{props.suffix}</span>}
				<button
					className="h-full px-4 cursor-pointer opacity-60 hover:opacity-100 active:opacity-100"
					onClick={handleUIEvent(() => setIsCustom(false))}
				>
					<XCircleIcon className="size-4" />
				</button>
			</label>
		);
	}

	return (
		<div className="join">
			{props.predefined.map((item) => (
				<input
					key={item.value}
					className={clsx("join-item btn flex-1", item.value === props.value && "btn-primary")}
					type="radio"
					name="predefined"
					aria-label={item.label}
					onChange={handlePredefinedChange(item)}
					checked={item.value === props.value}
				/>
			))}

			{!props.noCustom && (
				<button className="join-item btn" onClick={() => setIsCustom(true)}>
					Custom
				</button>
			)}
		</div>
	);
}
