import type { Iri } from "~t/types";
import { AlignLeft, Edit } from "iconoir-react";
import clsx from "clsx";
import { useCollectionTeaContext } from "~/pages/member/_components/MemberTeaContext";

export function EditableDescription(props: { collTeaIri: Iri; value?: string; className?: string }) {
	const context = useCollectionTeaContext();

	return (
		<div className={props.className}>
			{!props.value && (
				<button
					className={clsx(
						"mx-auto p-2 px-3 flex items-center justify-center rounded-full text-green-600 cursor-pointer ",
						"border border-green-700 hover:border-green-900 hover:text-green-900",
					)}
					onClick={() => context?.act("edit:description")}
				>
					Add a description <AlignLeft className="size-4 ml-2" />
				</button>
			)}
			{!!props.value && (
				<div className="px-4 py-3 bg-white rounded-xl shadow-sm">
					<p className="text-green-900">{props.value}</p>
					<button
						className="flex items-center w-full pt-2 mt-2 text-green-900/60 text-sm cursor-pointer hover:text-green-900"
						onClick={() => context?.act("edit:description")}
					>
						Edit the description
						<Edit className="size-4 ml-2 mt-0.5" />
					</button>
				</div>
			)}
		</div>
	);
}
