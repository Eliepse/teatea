import { Modal } from "~/components/shared/modal/Modal";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";
import { TypeAction } from "~/catalog/components/CreateTeaModal/TypeAction";
import { useState } from "react";
import { OriginAction } from "~/catalog/components/CreateTeaModal/OriginAction";
import { BusinessAction } from "~/catalog/components/CreateTeaModal/BusinessAction";
import { HarvestYearAction } from "~/catalog/components/CreateTeaModal/HarvestYearAction";
import { RoastAction } from "~/catalog/components/CreateTeaModal/RoastAction";
import { useMutation, useQuery } from "@tanstack/react-query";
import { makeCountSimilarTeasQueryOpt } from "~/catalog/query/teaQuery";
import { SimilarTeasWarning } from "~/catalog/components/CreateTeaModal/SimilarTeasWarning";
import { makeCreateTeaMutationOpt, type NewTeaData } from "~/catalog/mutation/createTeaMutation";
import { CultivarAction } from "~/catalog/components/CreateTeaModal/CultivarAction";

export function CreateTeaModal(props: { open?: boolean; onClose: () => void }) {
	const [tea, setTea] = useState<Partial<NewTeaData>>({});
	const hasRequiredData = !!tea.type;

	const similarQuery = useQuery({ ...makeCountSimilarTeasQueryOpt(tea), enabled: hasRequiredData });
	const hasSimilarTea = !similarQuery.isSuccess || 0 !== similarQuery.data;
	const canSubmit = hasRequiredData && !hasSimilarTea;

	const persistTea = useMutation(makeCreateTeaMutationOpt());

	function patch(patch: Partial<NewTeaData>) {
		setTea((st) => ({ ...st, ...patch }));
	}

	function submit() {
		const type = tea.type;

		if (!canSubmit || !type) {
			return;
		}


		persistTea.mutate({ ...tea, type });
	}

	return (
		<Modal open={props.open ?? false} className="h-full flex flex-col gap-4">
			<div className="flex-none flex gap-4 p-4 border-b border-green-200">
				<SecondaryButton className="flex-1" onClick={props.onClose}>
					Close
				</SecondaryButton>
				<PrimaryButton className="flex-2" disabled={!canSubmit} loading={persistTea.isPending} onClick={submit}>
					Create
				</PrimaryButton>
			</div>

			{hasRequiredData && <SimilarTeasWarning count={similarQuery.data} loading={similarQuery.isLoading} />}

			<div className="flex-1 mx-4">
				<ul className="grid grid-cols-2 gap-4">
					<li className="col-span-2">
						<TypeAction type={tea.type} onChange={(type) => patch({ type })} />
					</li>
					<li>
						<OriginAction origin={tea.origin} onChange={(origin) => patch({ origin })} />
					</li>
					<li>
						<BusinessAction business={tea.business} onChange={(business) => patch({ business })} />
					</li>
					<li>
						<CultivarAction cultivar={tea.cultivar} onChange={(cultivar) => patch({ cultivar })} />
					</li>
					<li>
						<HarvestYearAction year={tea.year} onChange={(year) => patch({ year })} />
					</li>
					<li>
						<RoastAction roast={tea.roast} onChange={(roast) => patch({ roast })} />
					</li>
				</ul>
			</div>
		</Modal>
	);
}
