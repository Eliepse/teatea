import Arrow from "~/components/icons/arrow";
import { useMultiStepForm } from "../BrewMultiStepForm";
import { useQuery } from "@tanstack/react-query";
import type { Teaware } from "~t/types";
import { Fragment, useState, type MouseEvent } from "react";
import { TeawareResultItem } from "~/components/search/teaware/TeawareResultItem";
import { Volume } from "~/utils/value-objects/units";
import type { DB } from "~t/database";
import { teawareTypes, type TeawareType } from "~t/teawareType";

async function fetchTeawer(): Promise<Teaware[]> {
	const response = await fetch(`/api/teaware`);
	return (await response.json()).map((teaware: DB.Teaware) => ({
		...teaware,
		volume: teaware.volume_ml ? Volume.fromMl(teaware.volume_ml) : undefined,
	}));
}

export function Step2() {
	const form = useMultiStepForm();
	const [value, setValue] = useState<Teaware | undefined>(form.formValue.teaware);

	const { data } = useQuery({
		queryFn: fetchTeawer,
		queryKey: ["search", "teaware"],
	});

	const groupByType = data?.reduce(
		(groups, item) => {
			if (!groups[item.type]) {
				groups[item.type] = [];
			}
			groups[item.type].push(item);
			return groups;
		},
		{} as { [key in TeawareType]: Teaware[] },
	);

	function toggleSelection(teaware: Teaware) {
		setValue((v) => (v === teaware ? undefined : teaware));
	}

	function handleConfirmBtn(e: MouseEvent) {
		e.stopPropagation();
		form.updateForm((v) => ({ ...v, teaware: value }));
		form.goTo(3);
	}

	return (
		<div className="h-full flex flex-col relative">
			<h2 className="px-6 py-4 border-b border-base-300 text-lg text-base-content">Select a teaware</h2>
			<div className="flex-1 overflow-auto pb-16">
				<ul className="list bg-base-100">
					{groupByType &&
						Object.entries(groupByType).map(([type, teawares]) => (
							<Fragment key={type}>
								<li className="p-4 pb-2 text-xs tracking-wide text-accent-content/50 sticky top-0 bg-white z-10">
									{teawareTypes[type as TeawareType]} ({teawares.length})
								</li>
								{teawares.map((teaware, i) => (
									<TeawareResultItem
										key={i}
										teaware={teaware}
										onClick={toggleSelection}
										selected={teaware === value}
									/>
								))}
							</Fragment>
						))}
				</ul>
			</div>

			<div className="absolute bottom-4 inset-x-4 flex justify-center gap-x-4">
				{!value && (
					<button className="btn rounded-full" onClick={handleConfirmBtn}>
						Skip <Arrow direction="right" className="size-4 ml-1" />
					</button>
				)}

				{value && (
					<button className="btn rounded-full btn-primary" onClick={handleConfirmBtn}>
						Next <Arrow direction="right" className="size-4 ml-1" />
					</button>
				)}
			</div>
		</div>
	);
}
