import { SteepCard } from "~/components/brewing/steepCard";
import { IfAuthor, useIsAuthor } from "~/auth/components/voters/IfAuthor";
import { f, handleUIEvent } from "~/utils/function";
import type { Id, Iri, Member, Steep } from "~t/types";
import { SteepFormModal } from "~/components/brewing/SteepFormModal";
import { useState } from "react";
import clsx from "clsx";

export function EditableSteepsList(props: {
	sessionId: Id;
	author?: Iri | Member;
	steeps: Steep[];
	onChange?: (steeps: Steep[]) => void | Promise<any>;
	className?: string;
	readonly?: boolean;
}) {
	const isAuthor = useIsAuthor(props.author);
	const [edit, setEdit] = useState<boolean | number>(false);
	const lastSteep = props.steeps.slice(-1)[0] ?? undefined;

	async function submitSteep(data: Steep) {
		if (props.readonly) {
			return;
		}

		// Replace the edited steep with the updated one
		if (typeof edit === "number") {
			await f(props.onChange)(props.steeps.map((s, i) => (i === edit ? data : s)));
			setEdit(false);
			return;
		}

		await f(props.onChange)([...props.steeps, data]);
		setEdit(false);
	}

	async function removeSteep(index: number) {
		if (props.readonly) {
			return;
		}

		await f(props.onChange)(props.steeps.filter((_, i) => i !== index));
		setEdit(false);
	}

	return (
		<div className={clsx(props.className, "bg-white rounded-xl py-1 gap-2 shadow")}>
			<ul>
				{props.steeps.map((steep, i) => (
					<li key={i}>
						<SteepCard
							duration={steep.duration}
							temperature={steep.temperature}
							order={i + 1}
							onEdit={isAuthor && true !== props.readonly ? () => setEdit(i) : undefined}
						/>
					</li>
				))}

				{true !== props.readonly && (
					<IfAuthor author={props.author}>
						<li className="px-4 py-2">
							<button className="btn btn-block btn-dash" onClick={handleUIEvent(() => setEdit(true))}>
								Add a steep
							</button>
						</li>
					</IfAuthor>
				)}
			</ul>

			{false !== edit && true !== props.readonly && (
				<SteepFormModal
					open
					defaultValue={typeof edit === "number" ? props.steeps[edit] : lastSteep}
					onClose={() => setEdit(false)}
					onSubmit={submitSteep}
					onRemove={typeof edit === "number" ? () => removeSteep(edit) : undefined}
				/>
			)}
		</div>
	);
}
