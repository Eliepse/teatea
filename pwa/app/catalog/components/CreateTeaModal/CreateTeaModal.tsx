import { Modal } from "~/components/shared/modal/Modal";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";
import { TypeAction } from "~/catalog/components/CreateTeaModal/TypeAction";
import { useEffect, useRef, useState } from "react";
import { OriginAction } from "~/catalog/components/CreateTeaModal/OriginAction";
import { BusinessAction } from "~/catalog/components/CreateTeaModal/BusinessAction";
import { HarvestYearAction } from "~/catalog/components/CreateTeaModal/HarvestYearAction";
import { RoastAction } from "~/catalog/components/CreateTeaModal/RoastAction";
import { useMutation, useQuery } from "@tanstack/react-query";
import { makeCountSimilarTeasQueryOpt } from "~/catalog/query/teaQuery";
import { SimilarTeasWarning } from "~/catalog/components/CreateTeaModal/SimilarTeasWarning";
import { makeCreateTeaMutationOpt, type NewTeaData } from "~/catalog/mutation/createTeaMutation";
import { CultivarAction } from "~/catalog/components/CreateTeaModal/CultivarAction";
import { ErrorBanner } from "~/catalog/components/CreateTeaModal/ErrorBanner";
import { useNavigate } from "react-router";
import type { Tea } from "~t/types";

const DEFAULT_TEA = {};

export function CreateTeaModal(props: {
	open?: boolean;
	defaultParams?: Partial<NewTeaData>;
	onCreated: (tea: Tea) => void;
	onClose: () => void;
}) {
	const isDirty = useRef(false);
	const [data, setData] = useState<Partial<NewTeaData>>(props.defaultParams ?? DEFAULT_TEA);
	const [error, setError] = useState<string | undefined>();
	const hasRequiredData = !!data.type;

	const similarQuery = useQuery({ ...makeCountSimilarTeasQueryOpt(data), enabled: hasRequiredData });
	const hasSimilarTea = !similarQuery.isSuccess || 0 !== similarQuery.data;
	const canSubmit = hasRequiredData && !hasSimilarTea;

	useEffect(() => {
		if (!props.open || isDirty.current) {
			return;
		}

		setData(props.defaultParams ?? DEFAULT_TEA);
	}, [props.open]);

	const persistTea = useMutation({
		...makeCreateTeaMutationOpt(),
		onSuccess: (tea) => {
			isDirty.current = false;
			props.onCreated(tea);
		},
		onError: (e) => {
			console.error(e);
			setError(e.message);
		},
	});

	function patch(patch: Partial<NewTeaData>) {
		isDirty.current = true;
		setData((st) => ({ ...st, ...patch }));
		setError(undefined);
	}

	function submit() {
		const type = data.type;

		if (!canSubmit || !type) {
			return;
		}

		persistTea.mutate({ ...data, type });
	}

	return (
		<Modal open={props.open ?? false} className="h-full flex flex-col gap-4">
			<div className="flex-none flex gap-4 p-4 border-b border-green-200">
				<SecondaryButton className="flex-1" onClick={props.onClose} disabled={persistTea.isPending}>
					Close
				</SecondaryButton>
				<PrimaryButton className="flex-2" disabled={!canSubmit} loading={persistTea.isPending} onClick={submit}>
					Create
				</PrimaryButton>
			</div>

			{hasRequiredData && <SimilarTeasWarning count={similarQuery.data} loading={similarQuery.isLoading} />}
			{error && <ErrorBanner className="mx-4">Failed to create this new tea</ErrorBanner>}

			<div className="flex-1 mx-4">
				<ul className="grid grid-cols-2 gap-4">
					<li className="col-span-2">
						<TypeAction
							type={data.type}
							onChange={(type) => patch({ type })}
							readonly={persistTea.isPending}
						/>
					</li>
					<li>
						<OriginAction
							origin={data.origin}
							onChange={(origin) => patch({ origin })}
							readonly={persistTea.isPending}
						/>
					</li>
					<li>
						<BusinessAction
							business={data.business}
							onChange={(business) => patch({ business })}
							readonly={persistTea.isPending}
						/>
					</li>
					<li>
						<CultivarAction
							cultivar={data.cultivar}
							onChange={(cultivar) => patch({ cultivar })}
							readonly={persistTea.isPending}
						/>
					</li>
					<li>
						<HarvestYearAction
							year={data.year}
							onChange={(year) => patch({ year })}
							readonly={persistTea.isPending}
						/>
					</li>
					<li>
						<RoastAction
							roast={data.roast}
							onChange={(roast) => patch({ roast })}
							readonly={persistTea.isPending}
						/>
					</li>
				</ul>
			</div>
		</Modal>
	);
}
