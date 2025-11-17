import { useSEContext } from "~/search/components/TeaSearchEngine";
import { FilterButton } from "~/search/components/FilterButton";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import { type Origin, teaFamilies, type TeaFamily } from "~t/types";
import { useState } from "react";
import { MenuItem, MenuModal } from "~/components/shared/navigation/MenuModal";
import { SelectOrigin } from "~/components/origin/SelectOrigin";
import { Modal } from "~/components/shared/modal/Modal";

export function SEFiltersBar(props: { className?: string }) {
	const { filters, patchFilters } = useSEContext();
	const [popup, setPopup] = useState<"family" | "origin" | undefined>(undefined);

	const originQuery = useQuery({
		queryFn: async (ctx) => await (await getApi<Origin>(`/origins/${ctx.queryKey[1]}`)).json(),
		queryKey: ["origin", filters?.originPath],
		enabled: !filters?.origin && !!filters?.originPath,
		refetchOnWindowFocus: false,
	});

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
							!filters.originPath
								? setPopup("origin")
								: patchFilters({ origin: undefined, originPath: undefined })
						}
						active={!!filters.originPath}
					>
						{originQuery.isLoading ? (
							<span className="skeleton w-16 h-4" />
						) : (
							<>{filters.origin?.name ?? originQuery?.data?.name ?? "Origin"}</>
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
			<Modal open={"origin" === popup} position="bottom" onClose={() => setPopup(undefined)} className="p-0">
				<SelectOrigin
					onSelect={(o) => {
						patchFilters({ origin: o, originPath: o?.path });
						setPopup(undefined);
					}}
					onBack={() => setPopup(undefined)}
					defaultOriginPath={filters?.originPath}
					allowToggle
				/>
			</Modal>
		</>
	);
}
