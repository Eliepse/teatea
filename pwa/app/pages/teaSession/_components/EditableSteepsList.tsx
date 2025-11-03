import { SteepCard } from "~/components/brewing/steepCard";
import { IfAuthor, useIsAuthor } from "~/auth/components/voters/IfAuthor";
import { f, handleUIEvent } from "~/utils/function";
import type { Id, Iri, Member, Steep } from "~t/types";
import { SteepFormModal, type SteepValues } from "~/components/brewing/SteepFormModal";
import { useState } from "react";
import { useAlert } from "~/components/shared/modal/AlertManager";
import { useMutation } from "@tanstack/react-query";
import { denormalizeSteep, type SteepRaw } from "~/utils/api/normalization/steep";
import { deleteApi, patchApi, postApi } from "~/utils/api";
import clsx from "clsx";

export function EditableSteepsList(props: {
	sessionId: Id;
	author?: Iri | Member;
	steeps: Steep[];
	onChange?: (steeps: Steep[]) => void;
	className?: string;
	readonly?: boolean;
}) {
	const isAuthor = useIsAuthor(props.author);
	const steepMutations = useSteepMutations(props.sessionId);
	const [edit, setEdit] = useState<Partial<SteepValues> | (SteepValues & Steep)>();

	// Use last steep to prefill form
	function newSteep() {
		const lastSteep = props.steeps.slice(-1)[0] ?? null;

		if (!lastSteep) {
			setEdit({});
			return;
		}

		setEdit({ duration: lastSteep.duration, temperature: lastSteep.temperature });
	}

	async function submitSteep(data: SteepValues) {
		if (true === props.readonly) {
			return;
		}

		if (undefined !== edit && "@id" in edit) {
			const steep = await steepMutations.edit.mutateAsync({ ...data, "@id": edit["@id"] });
			// Replace the displayed steep with the updated one
			f(props.onChange)(props.steeps.map((s) => (s.key === steep.key ? steep : s)));
			setEdit(undefined);
			return;
		}

		const steep = await steepMutations.add.mutateAsync(data);
		f(props.onChange)([...props.steeps, steep]);
		setEdit(undefined);
	}

	function makeRemoveHandler() {
		if (undefined === edit || !("@id" in edit)) {
			return undefined;
		}

		return async () => {
			if (true === props.readonly) {
				return;
			}

			const steep = await steepMutations.delete.mutateAsync(edit);
			f(props.onChange)(props.steeps.filter((stp) => steep.key !== stp.key));
			setEdit(undefined);
		};
	}

	return (
		<div className={clsx(props.className, "bg-white rounded-xl py-1")}>
			<ul>
				{props.steeps.map((steep, i) => (
					<li key={steep.key} className="mb-2">
						<SteepCard
							duration={steep.duration}
							temperature={steep.temperature}
							order={i + 1}
							onEdit={isAuthor && true !== props.readonly ? () => setEdit(steep) : undefined}
						/>
					</li>
				))}

				{true !== props.readonly && (
					<IfAuthor author={props.author}>
						<li className="px-4 py-2">
							<button className="btn btn-block btn-dash" onClick={handleUIEvent(newSteep)}>
								Add a steep
							</button>
						</li>
					</IfAuthor>
				)}
			</ul>

			{edit && true !== props.readonly && (
				<SteepFormModal
					open={undefined !== edit}
					defaultValue={edit}
					onClose={() => setEdit(undefined)}
					onSubmit={submitSteep}
					onRemove={makeRemoveHandler()}
				/>
			)}
		</div>
	);
}

function useSteepMutations(sessionId: number) {
	const uriPrefix = `/teaSessions/${sessionId}/steeps`;
	const alert = useAlert();

	const addMutation = useMutation({
		mutationFn: async (data: SteepValues) => {
			const response = await postApi<SteepRaw>(uriPrefix, {
				temperature: data.temperature?.deg,
				duration: data.duration.totalSeconds,
			});
			return denormalizeSteep(await response.json());
		},
		onError: (e) => alert({ title: "Failed to add the steep", body: e.message }),
	});

	const editMutation = useMutation({
		mutationFn: async (data: SteepValues & Pick<Steep, "@id">) => {
			const response = await patchApi<SteepRaw>(data["@id"], {
				temperature: data.temperature?.deg,
				duration: data.duration.totalSeconds,
			});
			return denormalizeSteep(await response.json());
		},
		onError: (e) => alert({ title: "Failed to edit the steep", body: e.message }),
	});

	const deleteMutation = useMutation({
		mutationFn: async (data: Steep) => {
			await deleteApi(data["@id"]);
			return data;
		},
		onError: (e) => alert({ title: "Failed to remove the steep", body: e.message }),
	});

	return { add: addMutation, edit: editMutation, delete: deleteMutation };
}
