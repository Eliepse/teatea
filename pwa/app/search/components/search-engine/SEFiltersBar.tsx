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
			<Modal open={"family" === popup} onClose={() => setPopup(undefined)} position="bottom">
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
					patchFilters({ originPath: extractId(iri) });
					setPopup(undefined);
				}}
				allowToggle
			/>
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
