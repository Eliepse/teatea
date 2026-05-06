import { teaFamilies, type TeaFamily } from "~t/types";
import styles from "./TeaFamilyFilter.module.css";
import { FilterButton } from "~/catalog/components/FilterButton";
import { Family } from "~/components/tea/Family";
import clsx from "clsx";

export function TeaFamilyFilter(props: { className?: string; onSelect: (value: TeaFamily) => void }) {
	return (
		<ul className={clsx(styles.list, "scrollbar-hide", props.className)}>
			{Object.keys(teaFamilies).map((key) => (
				<li key={key}>
					<FilterButton onClick={() => props.onSelect(key as TeaFamily)} noIcon>
						<Family family={key as TeaFamily} className="capitalize" />
					</FilterButton>
				</li>
			))}
		</ul>
	);
}
