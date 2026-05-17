import { Modal } from "~/components/shared/modal/Modal";
import { ArrowRight, Bonfire, Calendar, Shop, SoilAlt } from "iconoir-react";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";
import { TeaSpecButton } from "~/catalog/components/CreateTeaModal/TeaSpecButton";
import { FamilyTypeAction } from "~/catalog/components/CreateTeaModal/FamilyTypeAction";
import { useState } from "react";
import type { Iri, Origin, TeaFamily } from "~t/types";
import { OriginAction } from "~/catalog/components/CreateTeaModal/OriginAction";

type INewTea = {
	family: TeaFamily;
	type?: Iri;
	origin?: Origin["path"];
};

export function CreateTeaModal(props: { open?: boolean; onClose: () => void }) {
	const [tea, setTea] = useState<INewTea>({ family: "green" });

	function patch(patch: Partial<INewTea>) {
		setTea((st) => ({ ...st, ...patch }));
	}

	return (
		<Modal open={props.open ?? false} className="h-full p-4 pt-6 flex flex-col gap-4">
			<div className="flex-none flex gap-4">
				<SecondaryButton className="flex-1" onClick={props.onClose}>
					Close
				</SecondaryButton>
				<PrimaryButton className="flex-2" disabled>
					Create
				</PrimaryButton>
			</div>
			<div className="flex-none flex text-center rounded-lg px-3 py-2 bg-lime-100 text-lime-700 mb-2 text-sm">
				<p>1 exact same tea already exists</p>
				<button className="ml-auto text-lime-900">
					Open <ArrowRight className="ml-1 size-3 inline" />
				</button>
			</div>
			<div className="flex-1">
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
						<TeaSpecButton
							icon={<Shop className="size-4" />}
							label="Chanoki"
							onClick={console.debug}
							filled
						/>
						{/*Boutique*/}
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
