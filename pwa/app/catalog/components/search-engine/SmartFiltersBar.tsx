import { type SearchFilters } from "~/catalog/hooks/useSearchQuery";
import { TeaFamilyFilter } from "~/catalog/components/TeaFamilyFilter";
import { TypesFilterBar } from "~/catalog/components/filter/TypesFilterBar";

export function SmartFiltersBar(props: {
	filters: SearchFilters;
	onChange: (filters: SearchFilters) => void;
	className?: string;
}) {
	const searchText = props.filters.q?.trim() ?? "";

	function patchFilters(patch: Partial<SearchFilters>) {
		props.onChange({ ...props.filters, ...patch });
	}

	if (!props.filters.family && !props.filters.type && 2 > searchText.length) {
		return (
			<div className={props.className}>
				<h2 className="mb-2 uppercase text-xs text-green-900/80 font-medium">Tea families</h2>
				<TeaFamilyFilter onSelect={(family) => patchFilters({ family })} />
			</div>
		);
	}

	if (!props.filters.type) {
		return (
			<div className={props.className}>
				<h2 className="mb-2 uppercase text-xs text-green-900/80 font-medium">Tea types</h2>
				<TypesFilterBar
					family={props.filters.family}
					origin={props.filters.origin}
					q={props.filters.q}
					onSelect={(type) => patchFilters({ type: type.slug })}
				/>
			</div>
		);
	}

	return null;
}
