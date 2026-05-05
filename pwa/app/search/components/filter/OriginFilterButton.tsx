import { FilterButton } from "~/search/components/FilterButton";
import { extractId } from "~/utils/resource";
import { OriginSelectModal } from "~/components/origin/OriginSelectModal";
import { useState } from "react";
import type { Origin } from "~t/types";
import { useQuery } from "@tanstack/react-query";
import { makeOriginQueryOpt } from "~/shared/query/originQuery";

export function OriginFilterButton(props: {
	origin?: string;
	root?: string;
	onChange: (origin: string | undefined) => void;
}) {
	const value = props.origin ?? props.root;
	const [open, setOpen] = useState(false);
	const originQuery = useQuery(makeOriginQueryOpt(props.origin ?? props.root));

	return (
		<>
			<FilterButton
				onClick={() => (!value || props.root ? setOpen(true) : props.onChange(undefined))}
				active={!!value}
			>
				{originQuery.isLoading ? (
					<span className="skeleton w-16 h-4" />
				) : (
					<>{originQuery?.data?.name ?? "Origin"}</>
				)}
			</FilterButton>

			<OriginSelectModal
				open={open}
				defaultValue={value}
				rootOrigin={props.root}
				onSelect={(iri) => {
					props.onChange(iri ? extractId(iri) : props.root);
					setOpen(false);
				}}
				onClose={() => setOpen(false)}
				allowToggle
			/>
		</>
	);
}
