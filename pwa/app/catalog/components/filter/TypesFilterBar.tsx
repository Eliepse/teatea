import { useQuery } from "@tanstack/react-query";
import { makeTypeSearchQueryOpt } from "~/utils/query/teaTypeQuery";
import clsx from "clsx";
import styles from "~/catalog/components/TeaFamilyFilter.module.css";
import { type Origin, type TeaFamily, type TeaType } from "~t/types";
import { FilterButton } from "~/catalog/components/FilterButton";
import { Family } from "~/components/tea/Family";
import { FilterbarFallback } from "~/catalog/components/filter/FilterbarFallback";

export function TypesFilterBar(props: {
	q?: string;
	family?: TeaFamily;
	origin?: Origin["path"];
	onSelect: (type: TeaType) => void;
	className?: string;
}) {
	const query = useQuery(makeTypeSearchQueryOpt(props, { itemsPerPage: 8 }));

	if (query.isLoading) {
		return <FilterbarFallback />;
	}

	if (!query.data?.member?.length) {
		return null;
	}

	return (
		<ul className={clsx(styles.list, "scrollbar-hide", props.className)}>
			{query.data.member.map((type) => (
				<li key={type["@id"]}>
					<FilterButton onClick={() => props.onSelect(type)} noIcon>
						<Family family={type.family} iconOnly className="mr-2" />
						{type.name}
					</FilterButton>
				</li>
			))}
		</ul>
	);
}
