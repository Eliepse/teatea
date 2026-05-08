import { FilterButton } from "~/catalog/components/FilterButton";
import type { Business, Cultivar } from "~t/types";
import { useState } from "react";
import { Modal } from "~/components/shared/modal/Modal";
import { SelectCultivar } from "~/components/tea/SelectCultivar";
import { extractId } from "~/utils/resource";
import { Check } from "iconoir-react";
import { useQuery } from "@tanstack/react-query";
import { makeCultivarQueryOpt } from "~/shared/query/cultivarQuery";
import { makeBusinessQueryOpt } from "~/utils/query/businessQuery";
import { SelectBusinessFrame } from "~/components/teaSession/create/SelectBusinessFrame";

export function BusinessFilterButton(props: {
	business?: Business["id"];
	onChange: (business: Business["id"] | undefined) => void;
}) {
	const [open, setOpen] = useState(false);
	const businessQuery = useQuery(makeBusinessQueryOpt({ id: props.business }));

	return (
		<>
			<FilterButton
				onClick={() => (!props.business ? setOpen(true) : props.onChange(undefined))}
				active={!!props.business}
			>
				{businessQuery.isLoading ? (
					<span className="skeleton w-16 h-4" />
				) : (
					<>{businessQuery?.data?.name ?? "Boutique"}</>
				)}
			</FilterButton>
			<Modal open={open} onClose={() => setOpen(false)} className="p-0">
				<SelectBusinessFrame
					onConfirm={(iri) => {
						setOpen(false);
						const id = parseInt(extractId(iri) ?? "0");
						if (!id) {
							console.error(`Invalid business extracted from: ${iri}`);
							return;
						}
						props.onChange(id);
					}}
					defaultValue={props.business ? `/businesses/${props.business}` : undefined}
					onBack={() => setOpen(false)}
					confirmLabel="Confirm"
					// confirmIcon={<Check className="size-5 ml-1" />}
				/>
			</Modal>
		</>
	);
}
