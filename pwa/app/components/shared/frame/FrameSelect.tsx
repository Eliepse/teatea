import { PageLayout } from "~/components/shared/paged/PageLayout";
import Arrow from "~/components/icons/arrow";
import clsx from "clsx";
import { type Key, useState } from "react";
import { handleUIEvent } from "~/utils/function";

type Item<TValue extends Key> = {
	label: string;
	value: TValue;
};

export function FrameSelect<TValue extends Key = Key>(props: {
	items: Item<TValue>[];
	onConfirm: (value: TValue | undefined) => void;
	defaultValue?: TValue | undefined;
	buttonText?: string;
	required?: boolean;
	onBack?: () => void;
}) {
	const [value, setValue] = useState(props.defaultValue);
	const isValid = true !== props.required || undefined !== value;

	function toggleValue(item: (typeof props.items)[number]): void {
		setValue((st) => (st !== item.value ? item.value : undefined));
	}

	function confirm() {
		if (!isValid) {
			return;
		}

		props.onConfirm(value);
	}

	return (
		<PageLayout
			title="Select a technic"
			onBack={props.onBack}
			action={
				<button className="ml-auto btn btn-primary" onClick={handleUIEvent(confirm)} disabled={!isValid}>
					{props.buttonText ?? "Confirm"}
					<Arrow direction="right" className="size-4 ml-1" />
				</button>
			}
		>
			{props.items.map((item) => (
				<Item
					key={item.value}
					label={item.label}
					onSelect={() => toggleValue(item)}
					selected={value === item.value}
					className="mb-2"
				/>
			))}
		</PageLayout>
	);
}

function Item(props: { label: string; onSelect: () => void; selected: boolean; className?: string }) {
	return (
		<article
			className={clsx(
				"bg-base-100 px-4 py-3 flex rounded",
				props.selected ? "bg-primary text-white" : "bg-base-200",
				props.className,
			)}
			onClick={handleUIEvent(props.onSelect)}
		>
			{props.label}
		</article>
	);
}
