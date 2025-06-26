import { PageLayout } from "~/components/shared/paged/PageLayout";
import { useTeas } from "~/utils/api/useTeas";
import type { Tea } from "~t/types";
import clsx from "clsx";

export function SelectTeaFrame(props: { onBack: () => void; value?: Tea | null; onSelect: (tea: Tea) => void }) {
	const teasQuery = useTeas();
	const items = teasQuery?.data?.member ?? [];

	return (
		<PageLayout title="Select a tea" onBack={props.onBack}>
			{items.map((item) => (
				<TeaItem
					key={item["@id"]}
					name={item.name || item.type?.name || item.family}
					onSelect={() => props.onSelect(item)}
					selected={props.value?.["@id"] === item["@id"]}
					className="mb-2"
				/>
			))}
		</PageLayout>
	);
}

function TeaItem(props: { name: string; onSelect: () => void; selected?: boolean, className?: string }) {
	return (
		<button className={clsx("btn btn-block", props.selected && "btn-primary", props.className)} onClick={props.onSelect}>
			{props.name}
		</button>
	);
}
