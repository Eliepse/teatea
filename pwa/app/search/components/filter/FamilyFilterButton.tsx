import { FilterButton } from "~/search/components/FilterButton";
import { teaFamilies, type TeaFamily } from "~t/types";
import { Family } from "~/components/tea/Family";
import { Modal } from "~/components/shared/modal/Modal";
import { Item } from "~/search/components/search-engine/SEFiltersBar";
import { useState } from "react";

export function FamilyFilterButton(props: {
	family?: TeaFamily;
	onChange: (family: TeaFamily | undefined) => void;
	readonly?: boolean;
}) {
	const [open, setOpen] = useState(false);
	function openModal() {
		if (props.readonly) {
			return;
		}

		if(props.family) {
			props.onChange(undefined);
			return;
		}

		setOpen(true);
	}

	return (
		<>
			<FilterButton onClick={openModal} active={!!props.family} noIcon={props.readonly}>
				{props.family ?? "Family"}
			</FilterButton>
			<Modal open={open && !props.readonly} onClose={() => setOpen(false)} className="p-4">
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
									setOpen(false);
									props.onChange(key as TeaFamily);
								}}
								selected={key === props.family}
							/>
						</li>
					))}
				</ul>
			</Modal>
		</>
	);
}
