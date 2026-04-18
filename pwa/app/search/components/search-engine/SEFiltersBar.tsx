import { FilterButton } from "~/search/components/FilterButton";
import clsx from "clsx";
import { type Origin, teaFamilies, type TeaFamily } from "~t/types";
import { type ReactNode, useState } from "react";
import { useResourceQuery } from "~/utils/api/useResourceQuery";
import { OriginSelectModal } from "~/components/origin/OriginSelectModal";
import { extractId } from "~/utils/resource";
import { useSEContext } from "~/search/hooks/useSearchQuery";
import { Modal } from "~/components/shared/modal/Modal";
import { handleUIEvent } from "~/utils/function";
import styles from "~/components/origin/OriginSelect.module.css";
import { Family } from "~/components/tea/Family";
import { SelectCultivar } from "~/components/tea/SelectCultivar";
import { Check } from "iconoir-react";
import { YearFilterButton } from "~/search/components/filter/YearFilterButton";

type Filter = "family" | "origin" | "cultivar" | "year";

export function SEFiltersBar(props: { className?: string }) {
	const { filters, patchFilters } = useSEContext();
	const [popup, setPopup] = useState<Filter | undefined>(undefined);

	const originQuery = useResourceQuery<Origin>(filters.origin, "/origins/");
	const cultivarQuery = useResourceQuery<Origin>(filters.cultivar, "/cultivars/");

	function handleFamilyBtn() {
		if (filters.type) {
			return;
		}

		if (filters.family) {
			patchFilters({ family: undefined });
			return;
		}

		setPopup("family");
	}

	if (filters.type) {
		return null;
	}

	return (
		<>
			<ul className={clsx("overflow-y-auto flex gap-x-2", props.className)}>
				<li>
					<FilterButton onClick={handleFamilyBtn} active={!!filters.family}>
						{filters.family ?? "Family"}
					</FilterButton>
				</li>

				{!filters.type && (
					<li>
						<FilterButton
							onClick={() => (!filters.origin ? setPopup("origin") : patchFilters({ origin: undefined }))}
							active={!!filters.origin}
						>
							{originQuery.isLoading ? (
								<span className="skeleton w-16 h-4" />
							) : (
								<>{originQuery?.data?.name ?? "Origin"}</>
							)}
						</FilterButton>
					</li>
				)}

				<li>
					<FilterButton
						onClick={() =>
							!filters.cultivar ? setPopup("cultivar") : patchFilters({ cultivar: undefined })
						}
						active={!!filters.cultivar}
					>
						{cultivarQuery.isLoading ? (
							<span className="skeleton w-16 h-4" />
						) : (
							<>{cultivarQuery?.data?.name ?? "Cultivar"}</>
						)}
					</FilterButton>
				</li>

				<li>
					<YearFilterButton year={filters.year} onChange={(year) => patchFilters({ year })} />
				</li>
			</ul>
			<Modal open={"family" === popup && !filters.type} onClose={() => setPopup(undefined)} className="p-4">
				<ul className="flex flex-col gap-2">
					{Object.keys(teaFamilies).map((key) => (
						<li key={key}>
							<Item
								label={
									<>
										<Family family={key as TeaFamily} className="capitalize mr-1" />
										tea
									</>
								}
								onSelect={() => {
									patchFilters({ family: key as TeaFamily });
									setPopup(undefined);
								}}
								selected={key === filters.family}
							/>
						</li>
					))}
				</ul>
			</Modal>
			<OriginSelectModal
				open={"origin" === popup}
				onClose={() => setPopup(undefined)}
				onSelect={(iri) => {
					patchFilters({ origin: extractId(iri) });
					setPopup(undefined);
				}}
				allowToggle
			/>
			<Modal open={"cultivar" === popup} onClose={() => setPopup(undefined)} className="p-0">
				<SelectCultivar
					onConfirm={(v) => {
						patchFilters({ cultivar: extractId(v) });
						setPopup(undefined);
					}}
					defaultValue={filters.cultivar ? `/cultivars/${filters.cultivar}` : undefined}
					onBack={() => setPopup(undefined)}
					confirmLabel="Confirm"
					confirmIcon={<Check className="size-5 ml-1" />}
				/>
			</Modal>
		</>
	);
}

export function Item(props: { label: ReactNode; onSelect: () => void; selected?: boolean }) {
	return (
		<div className={clsx(styles.btn, props.selected && styles.selected, "w-full")}>
			<button className={clsx(styles.inner, "flex-1")} onClick={handleUIEvent(props.onSelect)}>
				{props.label}
			</button>
		</div>
	);
}
