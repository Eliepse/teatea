import { Modal } from "~/components/shared/modal/Modal";
import { ArrowRight, WarningTriangle } from "iconoir-react";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";
import { FamilyTypeAction } from "~/catalog/components/CreateTeaModal/FamilyTypeAction";
import { useState } from "react";
import type { Iri, RoastLevel, TeaFamily } from "~t/types";
import { OriginAction } from "~/catalog/components/CreateTeaModal/OriginAction";
import { BusinessAction } from "~/catalog/components/CreateTeaModal/BusinessAction";
import { CultivarAction } from "~/catalog/components/CreateTeaModal/CultivarAction";
import { HarvestYearAction } from "~/catalog/components/CreateTeaModal/HarvestYearAction";
import { RoastAction } from "~/catalog/components/CreateTeaModal/RoastAction";
import { useQuery } from "@tanstack/react-query";
import { makeCountSimilarTeasQueryOpt } from "~/catalog/query/teaQuery";
import { SimilarTeasWarning } from "~/catalog/components/CreateTeaModal/SimilarTeasWarning";

export type INewTea = {
	family: TeaFamily;
	type?: Iri;
	origin?: Iri;
	business?: Iri;
	cultivar?: Iri;
	year?: number;
	roast?: RoastLevel;
};

export function CreateTeaModal(props: { open?: boolean; onClose: () => void }) {
	const [tea, setTea] = useState<INewTea>({ family: "green" });
	const similarQuery = useQuery(makeCountSimilarTeasQueryOpt(tea));

	function patch(patch: Partial<INewTea>) {
		setTea((st) => ({ ...st, ...patch }));
	}

	return (
		<Modal open={props.open ?? false} className="h-full flex flex-col gap-4">
			<div className="flex-none flex gap-4 p-4 border-b border-green-200">
				<SecondaryButton className="flex-1" onClick={props.onClose}>
					Close
				</SecondaryButton>
				<PrimaryButton className="flex-2" disabled={!similarQuery.isSuccess || 0 !== similarQuery.data}>
					Create
				</PrimaryButton>
			</div>

			<SimilarTeasWarning count={similarQuery.data} loading={similarQuery.isLoading} />

			<div className="flex-1 mx-4">
				<ul className="grid grid-cols-2 gap-4">
					<li className="col-span-2">
						<FamilyTypeAction
							family={tea.family}
							type={tea.type}
							onChange={(family, type) => patch({ family, type })}
						/>
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
