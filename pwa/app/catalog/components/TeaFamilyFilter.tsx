import { teaFamilies, type TeaFamily } from "~t/types";
import styles from "./TeaFamilyFilter.module.css";
import { FilterButton } from "~/catalog/components/FilterButton";
import { Family } from "~/components/tea/Family";
import clsx from "clsx";

export function TeaFamilyFilter(props: {
	selected?: TeaFamily;
	className?: string;
	onSelect: (value: TeaFamily|undefined) => void;
	allChoice?: boolean,
}) {
	return (
		<ul className={clsx(styles.list, "scrollbar-hide", props.className)}>
			{props.allChoice && (
				<li>
					<FilterButton
						onClick={() => props.onSelect(undefined)}
						active={undefined === props.selected}
						noIcon
					>
						All
					</FilterButton>
				</li>
			)}

			{Object.keys(teaFamilies).map((key) => (
				<li key={key}>
					<FilterButton
						onClick={() => props.onSelect(key as TeaFamily)}
						active={key === props.selected}
						noIcon
					>
						<Family family={key as TeaFamily} className="capitalize" />
					</FilterButton>
				</li>
			))}
		</ul>
	);
}
