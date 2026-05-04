import { useSEContext } from "~/search/hooks/useSearchQuery";
import { TeaFamilyFilter } from "~/search/components/TeaFamilyFilter";
import { TypesFilterBar } from "~/search/components/filter/TypesFilterBar";
import { Suspense } from "react";

export function SmartFiltersBar(props: { className?: string }) {
	const { filters, patchFilters, loading } = useSEContext();
	const searchText = filters.q?.trim() ?? "";

	if (loading) {
		return <Fallback className={props.className} />;
	}

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
			<Suspense fallback={<Fallback className={props.className} />}>
				<div className={props.className}>
					<h2 className="mb-2 uppercase text-xs text-green-900/80 font-medium">Tea types</h2>
					<TypesFilterBar
						family={filters.family}
						origin={filters.origin}
						q={filters.q}
						onSelect={(type) => patchFilters({ type: type.slug })}
					/>
				</div>
			</Suspense>
		);
	}

	return null;
}

function Fallback(props: { className?: string }) {
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
