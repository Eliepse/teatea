import { FilterButton } from "~/catalog/components/FilterButton";
import { useState } from "react";
import { SelectYearModal } from "~/components/shared/modal/SelectYearModal";

export function YearFilterButton(props: { year?: number; onChange: (year: number | undefined) => void }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<FilterButton
				onClick={() => (!props.year ? setOpen(true) : props.onChange(undefined))}
				active={!!props.year}
			>
				{props.year ?? "Year"}
			</FilterButton>
			<SelectYearModal
				open={open}
				min={1850}
				value={props.year}
				onConfirm={(year) => {
					props.onChange(year);
					setOpen(false);
				}}
				onClose={() => setOpen(false)}
			/>
		</>
	);
}
