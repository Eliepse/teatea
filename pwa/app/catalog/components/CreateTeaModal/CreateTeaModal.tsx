import { Modal } from "~/components/shared/modal/Modal";
import { ArrowRight, Bonfire, Calendar, SoilAlt, WarningTriangle } from "iconoir-react";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";
import { TeaSpecButton } from "~/catalog/components/CreateTeaModal/TeaSpecButton";
import { FamilyTypeAction } from "~/catalog/components/CreateTeaModal/FamilyTypeAction";
import { useState } from "react";
import type { Iri, TeaFamily } from "~t/types";
import { OriginAction } from "~/catalog/components/CreateTeaModal/OriginAction";
import { BusinessAction } from "~/catalog/components/CreateTeaModal/BusinessAction";
import { Warning } from "postcss";

type INewTea = {
	family: TeaFamily;
	type?: Iri;
	origin?: Iri;
	business?: Iri;
};

export function CreateTeaModal(props: { open?: boolean; onClose: () => void }) {
	const [tea, setTea] = useState<INewTea>({ family: "green" });

	function patch(patch: Partial<INewTea>) {
		setTea((st) => ({ ...st, ...patch }));
	}

	return (
		<Modal open={props.open ?? false} className="h-full flex flex-col gap-4">
			<div className="flex-none flex gap-4 p-4 border-b border-green-200">
				<SecondaryButton className="flex-1" onClick={props.onClose}>
					Close
				</SecondaryButton>
				<PrimaryButton className="flex-2" disabled>
					Create
				</PrimaryButton>
			</div>
			<div className="flex-none flex text-center rounded-lg mx-4 px-3 py-2 bg-lime-100 text-lime-700 text-sm">
				<p><WarningTriangle className="inline size-4 mr-2" /> A tea with same parameters exists</p>
				<button className="ml-auto text-lime-900">
					Open <ArrowRight className="ml-1 size-3 inline" />
				</button>
			</div>
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
						<TeaSpecButton
							icon={<SoilAlt className="size-4" />}
							label="Sayamakaori"
							onClick={console.debug}
							filled
						/>
						{/*Cultivar*/}
					</li>
					<li>
						<TeaSpecButton
							icon={<Calendar className="size-4" />}
							label="Harvest year"
							onClick={console.debug}
						/>
					</li>
					<li>
						<TeaSpecButton icon={<Bonfire className="size-4" />} label="Roast" onClick={console.debug} />
					</li>
				</ul>
			</div>
		</Modal>
	);
}
