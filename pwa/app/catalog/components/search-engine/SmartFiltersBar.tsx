import { useSEContext } from "~/catalog/hooks/useSearchQuery";
import { TeaFamilyFilter } from "~/catalog/components/TeaFamilyFilter";
import { TypesFilterBar } from "~/catalog/components/filter/TypesFilterBar";

export function SmartFiltersBar(props: { className?: string }) {
	const { filters, patchFilters, loading } = useSEContext();
	const searchText = filters.q?.trim() ?? "";

	if (!filters.family && !filters.type && 2 > searchText.length) {
		return (
			<div className={props.className}>
				<h2 className="mb-2 uppercase text-xs text-green-900/80 font-medium">Tea families</h2>
				<TeaFamilyFilter onSelect={(family) => patchFilters({ family })} />
			</div>
		);
	}

	if (!filters.type) {
		return (
			<div className={props.className}>
				<h2 className="mb-2 uppercase text-xs text-green-900/80 font-medium">Tea types</h2>
				<TypesFilterBar
					family={filters.family}
					origin={filters.origin}
					q={filters.q}
					onSelect={(type) => patchFilters({ type: type.slug })}
				/>
			</div>
		);
	}

	return null;
}
