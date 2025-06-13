import Arrow from "~/components/icons/arrow";
import { useMultiStepForm } from "../BrewMultiStepForm";
import { useQuery } from "@tanstack/react-query";
import { ResultItem } from "~/components/search/tea-search/resultItem";
import type { Tea } from "~t/types";
import { useState, type MouseEvent } from "react";

async function searchTeas(
	params: { types?: number[]; origins?: number[]; text?: string },
	signal?: AbortSignal,
): Promise<Tea[]> {
	const sp = new URLSearchParams();
	params.types?.forEach((id) => sp.append("type[]", id.toString()));
	params.origins?.forEach((id) => sp.append("origin[]", id.toString()));

	if (params.text) {
		sp.append("q", params.text);
	}

	const response = await fetch(`/api/search?${sp.toString()}`, { signal });
	return await response.json();
}

export function Step1() {
	const form = useMultiStepForm();
	const [value, setValue] = useState<Tea | undefined>(form.formValue.tea);

	const { data } = useQuery({
		queryFn: async (query): Promise<Tea[]> => await searchTeas({}, query.signal),
		queryKey: ["search", "tea"],
	});

	function toggleSelection(tea: Tea) {
		setValue((v) => (v === tea ? undefined : tea));
	}

	function handleConfirmBtn(e: MouseEvent) {
		e.stopPropagation();

		if (undefined === value) {
			return;
		}

		form.updateForm((v) => ({ ...v, tea: value }));
		form.goTo(2);
	}

	return (
		<div className="h-full flex flex-col relative">
			<h2 className="px-6 py-4 border-b border-base-300 text-lg text-base-content">Select a tea</h2>
			<div className="flex-1 overflow-auto pb-16">
				<ul className="list bg-base-100">
					<li className="p-4 pb-2 text-xs tracking-wide text-accent-content/50 sticky top-0 bg-white z-10">
						All teas ({data?.length})
					</li>

					{data?.map((tea, i) => (
						<ResultItem key={i} tea={tea} onClick={toggleSelection} selected={tea === value} />
					))}
				</ul>
			</div>
			<div className="absolute bottom-4 inset-x-4 flex justify-center gap-x-4">
				{value && (
					<button className="btn rounded-full btn-primary" onClick={handleConfirmBtn}>
						Next <Arrow direction="right" className="size-4 ml-1" />
					</button>
				)}
			</div>
		</div>
	);
}
