import { Modal } from "~/components/shared/modal/Modal";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";
import { TypeAction } from "~/catalog/components/CreateTeaModal/TypeAction";
import { useState } from "react";
import type { Iri, RoastLevel } from "~t/types";
import { OriginAction } from "~/catalog/components/CreateTeaModal/OriginAction";
import { BusinessAction } from "~/catalog/components/CreateTeaModal/BusinessAction";
import { CultivarAction } from "~/catalog/components/CreateTeaModal/CultivarAction";
import { HarvestYearAction } from "~/catalog/components/CreateTeaModal/HarvestYearAction";
import { RoastAction } from "~/catalog/components/CreateTeaModal/RoastAction";
import { useQuery } from "@tanstack/react-query";
import { makeCountSimilarTeasQueryOpt } from "~/catalog/query/teaQuery";
import { SimilarTeasWarning } from "~/catalog/components/CreateTeaModal/SimilarTeasWarning";
import type { NewOrigin } from "~/components/origin/OriginSelect";

export type INewTea = {
	type?: Iri;
	origin?: Iri | NewOrigin;
	business?: Iri;
	cultivar?: Iri;
	year?: number;
	roast?: RoastLevel;
};

export function CreateTeaModal(props: { open?: boolean; onClose: () => void }) {
	const [tea, setTea] = useState<INewTea>({});
	const teaHasData = !!tea.type || !!tea.origin || !!tea.business || !!tea.cultivar || !!tea.year || !!tea.roast;

	const similarQuery = useQuery({ ...makeCountSimilarTeasQueryOpt(tea), enabled: teaHasData });
	const hasSimilarTea = !similarQuery.isSuccess || 0 !== similarQuery.data;

	function patch(patch: Partial<INewTea>) {
		setTea((st) => ({ ...st, ...patch }));
	}

	return (
		<Modal open={props.open ?? false} className="h-full flex flex-col gap-4">
			<div className="flex-none flex gap-4 p-4 border-b border-green-200">
				<SecondaryButton className="flex-1" onClick={props.onClose}>
					Close
				</SecondaryButton>
				<PrimaryButton className="flex-2" disabled={!hasSimilarTea}>
					Create
				</PrimaryButton>
			</div>

			{teaHasData && <SimilarTeasWarning count={similarQuery.data} loading={similarQuery.isLoading} />}

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
