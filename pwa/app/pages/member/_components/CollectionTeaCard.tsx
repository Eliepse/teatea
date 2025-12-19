import type { Business, Tea } from "~t/types";
import { limit } from "~/utils/text";
import { TeaCard, TeaCardSpec } from "~/components/tea/TeaCard";

export function CollectionTeaCard(props: {
	tea: Tea;
	description?: string;
	acquiredAt?: Date;
	acquiredFrom?: Business;
}) {
	if (!props.acquiredAt && !props.acquiredFrom && !props.description) {
		return (
			<TeaCard
				family={props.tea.family}
				cultivar={props.tea.cultivar}
				roast={props.tea.roast}
				type={props.tea.type}
				year={props.tea.year}
				origin={props.tea.origin}
				className="bg-white"
			/>
		);
	}

	return (
		<TeaCard
			family={props.tea.family}
			cultivar={props.tea.cultivar}
			roast={props.tea.roast}
			type={props.tea.type}
			year={props.tea.year}
			origin={props.tea.origin}
			className="bg-white"
		>
			{!!props.description && (
				<p className="px-4 py-2 mb-2 border-b border-dashed border-green-200 text-stone-600 text-sm">
					{limit(props.description, 128)}
				</p>
			)}

			<ul className="flex flex-col py-3 px-4 text-stone-500 gap-2 text-sm">
				{!!props.acquiredAt && <TeaCardSpec label="Acquired" value={props.acquiredAt.toLocaleDateString()} />}
				{!!props.acquiredFrom && <TeaCardSpec label="Shop" value={props.acquiredFrom.name} />}
			</ul>
		</TeaCard>
	);
}
