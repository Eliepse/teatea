import clsx from "clsx";
import { type ReactNode } from "react";
import { type SearchFilters } from "~/catalog/hooks/useSearchQuery";
import { handleUIEvent } from "~/utils/function";
import styles from "~/components/origin/OriginSelect.module.css";
import { YearFilterButton } from "~/catalog/components/filter/YearFilterButton";
import { OriginFilterButton } from "~/catalog/components/filter/OriginFilterButton";
import { FamilyFilterButton } from "~/catalog/components/filter/FamilyFilterButton";
import { CultivarFilterButton } from "~/catalog/components/filter/CultivarFilterButton";
import { BusinessFilterButton } from "~/catalog/components/filter/BusinessFilterButton";

export function FiltersBar(props: {
	filters: SearchFilters;
	onChange: (filters: SearchFilters) => void;
	className?: string;
}) {
	const showFamilyFilter = !props.filters.type || !!props.filters.family;

	function patchFilters(patch: Partial<SearchFilters>) {
		props.onChange({ ...props.filters, ...patch });
	}

	return (
		<>
			<ul className={clsx("overflow-y-auto scrollbar-hide flex gap-x-2", props.className)}>
				{showFamilyFilter && (
					<li>
						<FamilyFilterButton
							family={props.filters.family}
							onChange={(f) => patchFilters({ family: f })}
							readonly={!!props.filters.type}
						/>
					</li>
				)}

				<li>
					<OriginFilterButton
						origin={props.filters.origin}
						root={props.filters.rootOrigin}
						onChange={(origin) => patchFilters({ origin })}
					/>
				</li>

				<li>
					<CultivarFilterButton
						cultivar={props.filters.cultivar}
						onChange={(id) => patchFilters({ cultivar: id })}
					/>
				</li>

				<li>
					<BusinessFilterButton
						business={props.filters.business}
						onChange={(id) => patchFilters({ business: id })}
					/>
				</li>

				<li>
					<YearFilterButton year={props.filters.year} onChange={(year) => patchFilters({ year })} />
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
