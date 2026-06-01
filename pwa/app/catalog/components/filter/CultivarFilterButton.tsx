import { FilterButton } from "~/catalog/components/FilterButton";
import type { Cultivar } from "~t/types";
import { useState } from "react";
import { Modal } from "~/components/shared/modal/Modal";
import { SelectCultivar } from "~/components/tea/SelectCultivar";
import { extractId } from "~/utils/resource";
import { Check } from "iconoir-react";
import { useQuery } from "@tanstack/react-query";
import { makeCultivarQueryOpt } from "~/shared/query/cultivarQuery";

export function CultivarFilterButton(props: {
	cultivar?: Cultivar["id"];
	onChange: (cultivar: Cultivar["id"] | undefined) => void;
}) {
	const [open, setOpen] = useState(false);
	const cultivarQuery = useQuery(makeCultivarQueryOpt({ id: props.cultivar }));

	return (
		<>
			<FilterButton
				onClick={() => (!props.cultivar ? setOpen(true) : props.onChange(undefined))}
				active={!!props.cultivar}
			>
				{cultivarQuery.isLoading ? (
					<span className="skeleton w-16 h-4" />
				) : (
					<>{cultivarQuery?.data?.name ?? "Cultivar"}</>
				)}
			</FilterButton>
			<Modal open={open} onClose={() => setOpen(false)} className="p-0">
				<SelectCultivar
					onConfirm={(iri) => {
						setOpen(false);
						const id = parseInt(extractId(iri) ?? "0");
						if (!id) {
							console.error(`Invalid cultivar extracted from: ${iri}`);
							return;
						}
						props.onChange(id);
					}}
					defaultValue={props.cultivar ? `/cultivars/${props.cultivar}` : undefined}
					onBack={() => setOpen(false)}
					confirmLabel="Confirm"
					confirmIcon={<Check className="size-5 ml-1" />}
				/>
			</Modal>
		</>
	);
}
