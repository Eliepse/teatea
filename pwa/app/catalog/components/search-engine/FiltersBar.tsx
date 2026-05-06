import clsx from "clsx";
import { type ReactNode } from "react";
import { useSEContext } from "~/catalog/hooks/useSearchQuery";
import { handleUIEvent } from "~/utils/function";
import styles from "~/components/origin/OriginSelect.module.css";
import { YearFilterButton } from "~/catalog/components/filter/YearFilterButton";
import { OriginFilterButton } from "~/catalog/components/filter/OriginFilterButton";
import { FamilyFilterButton } from "~/catalog/components/filter/FamilyFilterButton";
import { CultivarFilterButton } from "~/catalog/components/filter/CultivarFilterButton";

export function FiltersBar(props: { className?: string }) {
	const { filters, patchFilters, rootOrigin } = useSEContext();

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
					<CultivarFilterButton
						cultivar={filters.cultivar}
						onChange={(id) => patchFilters({ cultivar: id })}
					/>
				</li>

				<li>
					<YearFilterButton year={filters.year} onChange={(year) => patchFilters({ year })} />
				</li>
			</ul>
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
