import { teaFamilies, type TeaFamily } from "~t/types";
import styles from "./TeaFamilyFilter.module.css";
import { FilterButton } from "~/search/components/FilterButton";

export function TeaFamilyFilter(props: { className?: string; onSelect: (value: TeaFamily) => void }) {
	return (
		<div className={props.className}>
			<h2 className="mb-2 uppercase text-xs text-green-900/80 font-medium">Tea families</h2>
			<ul className={styles.list}>
				{Object.keys(teaFamilies).map((key) => (
					<li key={key}>
						<FilterButton onClick={() => props.onSelect(key as TeaFamily)} noIcon>{key}</FilterButton>
					</li>
				))}
			</ul>
		</div>
	);
}
