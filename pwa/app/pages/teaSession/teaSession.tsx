import type { Route } from "../../../.react-router/types/app/pages/teaSession/+types/teaSession";
import { deleteApi, fetchApi, patchApi, postApi } from "~/utils/api";
import type { Steep, TeaSession } from "~t/types";
import { denormalizeTeaSession, type TeaSessionRaw } from "~/utils/api/normalization/teaSession";
import { intlFormat } from "date-fns";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import { Link, useNavigate } from "react-router";
import Arrow from "~/components/icons/arrow";
import { Modal } from "~/components/shared/modal/Modal";
import { type ChangeEvent, useState } from "react";
import { handleUIEvent } from "~/utils/function";
import { useMutation } from "@tanstack/react-query";
import { PencilSquare } from "~/components/icons/pencilSquare";
import { nl2br } from "~/utils/content";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { ArrowTopRightOnSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { AuthLayout } from "~/layouts/AuthLayout";
import Leaf from "~/components/icons/leaf";
import WaterDrop from "~/components/icons/WaterDrop";
import { SteepCard } from "~/components/brewing/steepCard";
import { SteepFormModal, type SteepValues } from "~/components/brewing/SteepFormModal";
import { denormalizeSteep, type SteepRaw } from "~/utils/api/normalization/steep";
import { useAlert } from "~/components/shared/modal/AlertManager";
import { IfAuthor, useIsAuthor } from "~/auth/components/voters/IfAuthor";

export async function clientLoader(props: Route.ClientLoaderArgs): Promise<TeaSession> {
	const id = parseInt(props.params.id);
	const response = await fetchApi<TeaSessionRaw>(`/tea_sessions/${id}`);
	return denormalizeTeaSession(await response.json());
}

export default function TeaSessionPage(props: Route.ComponentProps) {
	const [session, setSession] = useState(props.loaderData);
	const author = typeof session.author === "string" ? { "@id": session.author } : session.author;
	const isAuthor = useIsAuthor(author);
	const [editSteep, setEditSteep] = useState<Partial<SteepValues> | (SteepValues & Steep)>();
	const [showNodeEditor, setShowNodeEditor] = useState(false);
	const [noteValue, setNoteValue] = useState(session.note);
	const sessionMutations = useSessionMutations(session.id);
	const steepMutations = useSteepMutations(session.id);
	const editableData = { ...session, ...sessionMutations.edit.data };

	function handleNoteChange(e: ChangeEvent<HTMLTextAreaElement>) {
		setNoteValue(e.currentTarget.value);
	}

	function newSteep() {
		const lastSteep = session.steeps?.slice(-1)[0] ?? null;

		if (!lastSteep) {
			setEditSteep({});
			return;
		}

		setEditSteep({ duration: lastSteep.duration, temperature: lastSteep.temperature });
	}

	async function submitSteep(data: SteepValues) {
		if (undefined !== editSteep && "@id" in editSteep) {
			const steep = await steepMutations.edit.mutateAsync({ ...data, "@id": editSteep["@id"] });
			// Replace the displayed steep with the updated one
			setSession((sess) => ({ ...sess, steeps: sess.steeps?.map((s) => (s.key === steep.key ? steep : s)) }));
			setEditSteep(undefined);
			return;
		}

		const steep = await steepMutations.add.mutateAsync(data);
		setSession((sess) => ({ ...sess, steeps: [...(sess.steeps ?? []), steep] }));
		setEditSteep(undefined);
	}

	function makeRemoveHandler() {
		if (undefined === editSteep || !("@id" in editSteep)) {
			return undefined;
		}

		return async () => {
			const steep = await steepMutations.delete.mutateAsync(editSteep);
			setSession((sess) => ({ ...sess, steeps: sess?.steeps?.filter((stp) => steep.key !== stp.key) }));
			setEditSteep(undefined);
		};
	}

	return (
		<AuthLayout className="px-4" activeKey="activity">
			<header className="py-4">
				<div className="flex">
					<Link to="/sessions" className="block link mb-8">
						<Arrow direction="left" className="inline size-4 mr-2" />
						Sessions history
					</Link>

					<IfAuthor author={author}>
						<div className="dropdown dropdown-end ml-auto">
							<div tabIndex={0} role="button" className="m-1">
								<EllipsisVerticalIcon className="size-5" />
							</div>
							<ul
								tabIndex={0}
								className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
							>
								<li
									className="text-error"
									onClick={handleUIEvent(() => sessionMutations.delete.mutate())}
								>
									<span>
										<TrashIcon className="size-3 inline mr-1" />
										Delete
									</span>
								</li>
							</ul>
						</div>
					</IfAuthor>
				</div>

				<div className="uppercase text-xs text-base-content/60">
					{intlFormat(session.drankAt, { dateStyle: "long" })}
				</div>
				<div className="text-2xl mt-2">
					<Link to={`/tea/${session.tea.id}`}>
						{session.tea.displayName}
						<ArrowTopRightOnSquareIcon className="size-4 text-base-content/60 inline-block ml-2" />
					</Link>
				</div>
				<div className="text-sm mt-1">
					<span>
						<span className="capitalize">{session.tea.family}</span> tea
					</span>

					{session.tea.originPath && (
						<span>
							{" "}
							&middot; <FormatOriginPath originPath={session.tea.originPath} />
						</span>
					)}
				</div>

				<div className="mt-4 grid grid-cols-2 gap-4">
					{!!session.teaQuantity && (
						<div className="flex justify-between items-center rounded-md bg-base-200 px-3 py-1">
							<Leaf className="size-3 text-green-300" />
							<span>{`${session.teaQuantity} g`}</span>
						</div>
					)}

					{!!session.waterMl && (
						<div className="flex justify-between items-center rounded-md bg-base-200 px-3 py-1">
							<WaterDrop className="size-3 text-blue-300" />
							<span>{`${session.waterMl} ml`}</span>
						</div>
					)}
				</div>
			</header>

			<div className="mt-4 mb-12">
				{!!editableData.note && (
					<>
						<h2 className="flex text-sm text-base-content/60 mb-1">
							<span>Tasting note</span>
							<IfAuthor author={author}>
								<button
									className="ml-auto py-2 -my-2 flex items-center text-info"
									onClick={handleUIEvent(() => setShowNodeEditor(true))}
								>
									<PencilSquare className="size-3 inline mr-2" version="micro" /> Edit
								</button>
							</IfAuthor>
						</h2>
						<p className="leading-normal text-lg rounded bg-stone-100 text-gray-800 px-4 py-2 pb-3">
							{nl2br(editableData.note)}
						</p>
					</>
				)}

				<IfAuthor author={author}>
					{!editableData.note && (
						<button
							className="btn btn-block btn-dash mt-2"
							onClick={handleUIEvent(() => setShowNodeEditor(true))}
						>
							Add a tasting note
						</button>
					)}
				</IfAuthor>
			</div>

			{!!session.steeps?.length && <h2 className="uppercase text-xs text-base-content/60 mb-2">Steeps</h2>}
			<ul>
				{session.steeps?.map((steep, i) => (
					<li key={steep.key} className="mb-2">
						<SteepCard
							duration={steep.duration}
							temperature={steep.temperature}
							order={i + 1}
							onEdit={isAuthor ? () => setEditSteep(steep) : undefined}
						/>
					</li>
				))}
				<IfAuthor author={author}>
					<li className="mb-2">
						<button className="btn btn-block btn-dash mt-2" onClick={handleUIEvent(newSteep)}>
							Add a steep
						</button>
					</li>
				</IfAuthor>
			</ul>

			{editSteep && (
				<SteepFormModal
					open={undefined !== editSteep}
					defaultValue={editSteep}
					onClose={() => setEditSteep(undefined)}
					onSubmit={submitSteep}
					onRemove={makeRemoveHandler()}
				/>
			)}

			<Modal onClose={() => setShowNodeEditor(false)} open={showNodeEditor} position="bottom" backdrop>
				<textarea className="textarea w-full h-96" onChange={handleNoteChange} value={noteValue} />

				<div className="flex mt-2">
					<button className="btn" onClick={handleUIEvent(() => setShowNodeEditor(false))}>
						Cancel
					</button>
					<button
						className="btn btn-primary ml-auto"
						onClick={handleUIEvent(async () => {
							await sessionMutations.edit.mutateAsync({ note: noteValue });
							setShowNodeEditor(false);
						})}
						disabled={sessionMutations.edit.isPending}
					>
						Save
					</button>
				</div>
			</Modal>
		</AuthLayout>
	);
}

function useSessionMutations(sessionId: number) {
	const navigate = useNavigate();

	const editMutation = useMutation({
		mutationFn: async (args: Partial<Pick<TeaSession, "note">>) => {
			const response = await patchApi<TeaSessionRaw>(`/tea_sessions/${sessionId}`, args);
			return denormalizeTeaSession(await response.json());
		},
	});
	const deleteMutation = useMutation({
		mutationFn: async () => await deleteApi(`/tea_sessions/${sessionId}`),
		onSuccess: () => navigate("/sessions"),
	});

	return { edit: editMutation, delete: deleteMutation };
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
