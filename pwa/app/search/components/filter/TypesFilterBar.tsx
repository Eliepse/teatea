import { useSuspenseQuery } from "@tanstack/react-query";
import { makeTypeSearchQueryOpt } from "~/utils/query/teaTypeQuery";
import clsx from "clsx";
import styles from "~/search/components/TeaFamilyFilter.module.css";
import { type Origin, type TeaFamily, type TeaType } from "~t/types";
import { FilterButton } from "~/search/components/FilterButton";
import { TeaFamilyFilter } from "~/search/components/TeaFamilyFilter";
import { Family } from "~/components/tea/Family";

export async function TypesFilterBar(props: {
	q?: string;
	family?: TeaFamily;
	origin?: Origin["path"];
	onSelect: (type: TeaType) => void;
	className?: string;
}) {
	const query = useSuspenseQuery(makeTypeSearchQueryOpt(props, 8));

	if (!query.data.member.length) {
		return null;
	}

	return (
		<ul className={clsx(styles.list, "scrollbar-hide", props.className)}>
			{query.data.member.map((type) => (
				<li key={type.id}>
					<FilterButton onClick={() => props.onSelect(type)} noIcon>
						<Family family={type.family} iconOnly className="mr-2" />
						{type.name}
					</FilterButton>
				</li>
			))}
		</ul>
	);
}
