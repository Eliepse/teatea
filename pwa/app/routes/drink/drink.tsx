import type { Route } from "../../../.react-router/types/app/routes/drink/+types/drink";
import { deleteApi, fetchApi, patchApi } from "~/utils/api";
import type { Drink } from "~t/types";
import { denormalizeDrink, type DrinkRaw } from "~/utils/api/normalization/drink";
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
import { TrashIcon } from "@heroicons/react/16/solid";

export async function clientLoader(props: Route.ClientLoaderArgs): Promise<Drink> {
	const id = parseInt(props.params.id);

	if (id <= 0) {
		throw new Error("Ooops, the id is invalid!");
	}

	const response = await fetchApi<DrinkRaw>(`/drinks/${id}`);
	return denormalizeDrink(await response.json());
}

export default function DrinkPage(props: Route.ComponentProps) {
	const drink = props.loaderData;
	const navigate = useNavigate();
	const [showNodeEditor, setShowNodeEditor] = useState(false);
	const [noteValue, setNoteValue] = useState(drink.note);
	const editMutation = useMutation({
		mutationFn: async (args: Partial<Pick<Drink, "note">>) => {
			const response = await patchApi<DrinkRaw>(`/drinks/${drink.id}`, args);
			return denormalizeDrink(await response.json());
		},
		onSuccess: () => setShowNodeEditor(false),
	});
	const deleteMutation = useMutation({
		mutationFn: async () => await deleteApi(`/drinks/${drink.id}`),
		onSuccess: () => navigate("/me/drinks"),
	});
	const editableData = { ...drink, ...editMutation.data };

	function handleNoteChange(e: ChangeEvent<HTMLTextAreaElement>) {
		setNoteValue(e.currentTarget.value);
	}

	return (
		<div>
			<header className="p-4">
				<div className="flex">
					<Link to="/me/drinks" className="block link mb-8">
						<Arrow direction="left" className="inline size-4 mr-2" />
						Drink history
					</Link>

					<div className="dropdown dropdown-end ml-auto">
						<div tabIndex={0} role="button" className="m-1">
							<EllipsisVerticalIcon className="size-5" />
						</div>
						<ul
							tabIndex={0}
							className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
						>
							<li className="text-error" onClick={handleUIEvent(() => deleteMutation.mutate())}>
								<span>
									<TrashIcon className="size-3 inline mr-1" />
									Delete
								</span>
							</li>
						</ul>
					</div>
				</div>

				<div className="uppercase text-xs text-base-content/60">
					{intlFormat(drink.drankAt, { dateStyle: "long" })}
				</div>
				<div className="text-2xl mt-2">{drink.tea.displayName}</div>
				<div className="text-sm mt-1">
					<span>
						<span className="capitalize">{drink.tea.family}</span> tea
					</span>

					{drink.tea.originPath && (
						<span>
							{" "}
							&middot; <FormatOriginPath originPath={drink.tea.originPath} />
						</span>
					)}
				</div>
			</header>

			<div className="p-4">
				{!!editableData.note && (
					<>
						<h2 className="flex text-sm text-base-content/60 mb-1">
							<span>Tasting note</span>
							<button
								className="ml-auto py-2 -my-2 flex items-center text-info"
								onClick={handleUIEvent(() => setShowNodeEditor(true))}
							>
								<PencilSquare className="size-3 inline mr-2" version="micro" /> Edit
							</button>
						</h2>
						<p className="leading-normal">{nl2br(editableData.note)}</p>
					</>
				)}

				{!editableData.note && (
					<button
						className="btn btn-block btn-dash mt-2"
						onClick={handleUIEvent(() => setShowNodeEditor(true))}
					>
						Add a tasting note
					</button>
				)}
			</div>

			<Modal onClose={() => setShowNodeEditor(false)} open={showNodeEditor} position="bottom" backdrop>
				<textarea className="textarea w-full h-96" onChange={handleNoteChange} value={noteValue} />

				<div className="flex mt-2">
					<button className="btn" onClick={handleUIEvent(() => setShowNodeEditor(false))}>
						Cancel
					</button>
					<button
						className="btn btn-primary ml-auto"
						onClick={handleUIEvent(() => editMutation.mutate({ note: noteValue }))}
						disabled={editMutation.isPending}
					>
						Save
					</button>
				</div>
			</Modal>
		</div>
	);
}
