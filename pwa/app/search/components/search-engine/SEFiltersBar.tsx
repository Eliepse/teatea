import { FilterButton } from "~/search/components/FilterButton";
import clsx from "clsx";
import { type Origin } from "~t/types";
import { type ReactNode, useState } from "react";
import { useResourceQuery } from "~/utils/api/useResourceQuery";
import { extractId } from "~/utils/resource";
import { useSEContext } from "~/search/hooks/useSearchQuery";
import { Modal } from "~/components/shared/modal/Modal";
import { handleUIEvent } from "~/utils/function";
import styles from "~/components/origin/OriginSelect.module.css";
import { SelectCultivar } from "~/components/tea/SelectCultivar";
import { Check } from "iconoir-react";
import { YearFilterButton } from "~/search/components/filter/YearFilterButton";
import { OriginFilterButton } from "~/search/components/filter/OriginFilterButton";
import { FamilyFilterButton } from "~/search/components/filter/FamilyFilterButton";

export function SEFiltersBar(props: { className?: string }) {
	const { filters, patchFilters, rootOrigin } = useSEContext();
	const [popup, setPopup] = useState<"cultivar" | undefined>(undefined);

	const cultivarQuery = useResourceQuery<Origin>(filters.cultivar, "/cultivars/");

	return (
		<>
			<ul className={clsx("overflow-y-auto scrollbar-hide flex gap-x-2", props.className)}>
				{(!filters.type || !!filters.family) && (
					<li>
						<FamilyFilterButton
							family={filters.family}
							onChange={(f) => patchFilters({ family: f })}
							readonly={!!filters.type}
						/>
					</li>
				)}

				<li>
					<OriginFilterButton
						origin={filters.origin}
						root={filters.rootOrigin}
						onChange={(origin) => patchFilters({ origin })}
					/>
				</li>

				<li>
					<FilterButton
						onClick={() =>
							!filters.cultivar ? setPopup("cultivar") : patchFilters({ cultivar: undefined })
						}
						active={!!filters.cultivar}
						noIcon={!!rootOrigin}
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
