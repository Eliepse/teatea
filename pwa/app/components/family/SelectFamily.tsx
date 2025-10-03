import { PageLayout } from "~/components/shared/paged/PageLayout";
import { teaFamilies, type TeaFamily } from "~t/types";
import clsx from "clsx";
import { handleUIEvent } from "~/utils/function";
import { useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export function SelectFamily(
	props: {
		onBack: () => void;
		defaultValue?: TeaFamily;
		allowCreation?: boolean;
	} & (
		| { onSelect: (value?: TeaFamily) => void; allowToggle: true }
		| { onSelect: (value: TeaFamily) => void; allowToggle?: false }
	),
) {
	const [selected, setSelected] = useState(props.defaultValue);

	function confirm(): void {
		if (props.allowToggle) {
			props.onSelect(selected);
			return;
		}

		if (!selected) {
			console.warn("No family selected");
			return;
		}

		props.onSelect(selected);
	}

	function onChange(family: TeaFamily) {
		if (props.allowToggle) {
			setSelected((st) => (st === family ? undefined : family));
			return;
		}

		setSelected(family);
	}

	return (
		<PageLayout
			title="Which family is it part of?"
			onBack={props.onBack}
			bodyClassName="flex flex-col"
			action={
				<button
					className="btn btn-primary ml-auto"
					onClick={handleUIEvent(confirm)}
					disabled={!props.allowToggle && !selected}
				>
					Next <ArrowRightIcon className="size-4" />
				</button>
			}
		>
			<ul className="mt-auto">
				{Object.entries(teaFamilies).map(([key, label]) => (
					<li key={key}>
						<button
							onClick={handleUIEvent(() => onChange(key as TeaFamily))}
							className={clsx("mb-2 btn btn-block h-16 justify-start", selected === key && "btn-primary")}
						>
							{label}
						</button>
					</li>
				))}
			</ul>
		</PageLayout>
	);
}
