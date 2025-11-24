import { FilterButton } from "~/search/components/FilterButton";
import clsx from "clsx";
import { type Origin, teaFamilies, type TeaFamily } from "~t/types";
import { useState } from "react";
import { MenuItem, MenuModal } from "~/components/shared/navigation/MenuModal";
import { useResourceQuery } from "~/utils/api/useResourceQuery";
import { OriginSelectModal } from "~/components/origin/OriginSelectModal";
import { extractId } from "~/utils/resource";
import { useSEContext } from "~/search/hooks/useSearchQuery";

export function SEFiltersBar(props: { className?: string }) {
	const { filters, patchFilters } = useSEContext();
	const [popup, setPopup] = useState<"family" | "origin" | undefined>(undefined);

	const originQuery = useResourceQuery<Origin>(filters.originPath, "/origins/");

	return (
		<>
			<ul className={clsx("overflow-y-auto flex gap-x-2", props.className)}>
				<li>
					<FilterButton
						onClick={() => (!filters.family ? setPopup("family") : patchFilters({ family: undefined }))}
						active={!!filters.family}
					>
						{filters.family ?? "Family"}
					</FilterButton>
				</li>

				<li>
					<FilterButton
						onClick={() =>
							!filters.originPath ? setPopup("origin") : patchFilters({ originPath: undefined })
						}
						active={!!filters.originPath}
					>
						{originQuery.isLoading ? (
							<span className="skeleton w-16 h-4" />
						) : (
							<>{originQuery?.data?.name ?? "Origin"}</>
						)}
					</FilterButton>
				</li>
			</ul>
			<MenuModal open={"family" === popup} onClose={() => setPopup(undefined)}>
				{Object.keys(teaFamilies).map((key) => (
					<MenuItem
						key={key}
						label={`${key} tea`}
						onClick={() => {
							patchFilters({ family: key as TeaFamily });
							setPopup(undefined);
						}}
					/>
				))}
			</MenuModal>
			<OriginSelectModal
				open={"origin" === popup}
				onClose={() => setPopup(undefined)}
				onSelect={(iri) => {
					patchFilters({ originPath: extractId(iri) });
					setPopup(undefined);
				}}
				allowToggle
			/>
		</>
	);
}
