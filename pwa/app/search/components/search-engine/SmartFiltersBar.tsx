import { useSEContext } from "~/search/hooks/useSearchQuery";
import { TeaFamilyFilter } from "~/search/components/TeaFamilyFilter";

export function SmartFiltersBar(props: { className?: string }) {
	const { filters, patchFilters, loading } = useSEContext();

	if (loading) {
		return (
			<div className={props.className}>
				<span className="mb-2 uppercase text-xs text-green-900/80 font-medium skeleton h-4 w-24 block" />
				<ul className="flex gap-x-4">
					<li className="skeleton h-8 w-24 block"></li>
					<li className="skeleton h-8 w-24 block"></li>
					<li className="skeleton h-8 w-24 block"></li>
					<li className="skeleton h-8 w-24 block"></li>
				</ul>
			</div>
		);
	}

	if (!filters.family && !filters.type) {
		return (
			<div className={props.className}>
				<h2 className="mb-2 uppercase text-xs text-green-900/80 font-medium">Tea families</h2>
				<TeaFamilyFilter className="" onSelect={(family) => patchFilters({ family })} />
			</div>
		);
	}

	return null;
}
