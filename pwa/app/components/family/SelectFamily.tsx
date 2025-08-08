import { PageLayout } from "~/components/shared/paged/PageLayout";
import { teaFamilies, type TeaFamily } from "~t/types";
import clsx from "clsx";
import { handleUIEvent } from "~/utils/function";
import { useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export function SelectFamily(props: {
	onBack: () => void;
	onSelect: (value: TeaFamily) => void;
	defaultValue?: TeaFamily;
}) {
	const [selected, setSelected] = useState(props.defaultValue);

	function confirm(): void {
		if (undefined === selected) {
			console.warn("No family selected");
			return;
		}

		props.onSelect(selected);
	}

	return (
		<PageLayout
			title="Which family is it part of?"
			onBack={props.onBack}
			bodyClassName="flex flex-col"
			action={
				<button className="btn btn-primary ml-auto" onClick={handleUIEvent(confirm)} disabled={!selected}>
					Next <ArrowRightIcon className="size-4" />
				</button>
			}
		>
			<ul className="mt-auto">
				{Object.entries(teaFamilies).map(([key, label]) => (
					<li key={key}>
						<button
							onClick={handleUIEvent(() => setSelected(key as TeaFamily))}
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
