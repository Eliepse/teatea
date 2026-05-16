import type { Route } from "./+types/teaSession";
import { deleteApi, patchApi } from "~/utils/api";
import { BrewingQualityEnum, type Iri, type NullablePartial, RoastLevelEnum, type TeaSession } from "~t/types";
import { denormalizeTeaSession, type TeaSessionRaw } from "~/utils/api/normalization/teaSession";
import { intlFormat } from "date-fns";
import { Link, useNavigate, useRevalidator, useSearchParams } from "react-router";
import { Modal } from "~/components/shared/modal/Modal";
import { type ChangeEvent, type ReactNode, useState } from "react";
import { handleUIEvent } from "~/utils/function";
import { useMutation } from "@tanstack/react-query";
import { PencilSquare } from "~/components/icons/pencilSquare";
import { nl2br } from "~/utils/content";
import { WithMainMenu } from "~/layouts/WithMainMenu";
import Leaf from "~/components/icons/leaf";
import WaterDrop from "~/components/icons/WaterDrop";
import { IfAuthor, useIsAuthor } from "~/auth/components/voters/IfAuthor";
import { EditableSteepsList } from "~/pages/teaSession/_components/EditableSteepsList";
import { BrewingQualityInput, QualityLabel } from "~/components/shared/inputs/BrewingQualityInput";
import { Check, CoffeeCup, Edit, EmojiPuzzled, EmojiSad, EmojiSatisfied, MoreVert, Trash, Xmark } from "iconoir-react";
import clsx from "clsx";
import { useMember } from "~/utils/api/useMember";
import { useAlert, usePopup } from "~/components/shared/modal/AlertManager";
import { TeaCard } from "~/components/tea/TeaCard";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { MenuItem, MenuModal } from "~/components/shared/navigation/MenuModal";
import { ParametersInput } from "~/components/teaSession/create/ParametersInput";
import { extractId } from "~/utils/resource";
import { Badge } from "~/components/shared/Badge";
import { queryTeaSession } from "~/utils/query/queryTeaSession";
import { FloatingActions } from "~/layouts/FloatingActions";

const QualityIcon = {
	[BrewingQualityEnum.Good]: <EmojiSatisfied className="size-5" />,
	[BrewingQualityEnum.Improvable]: <EmojiPuzzled className="size-5" />,
	[BrewingQualityEnum.Bad]: <EmojiSad className="size-5" />,
};

export async function clientLoader(props: Route.ClientLoaderArgs) {
	return queryTeaSession(parseInt(props.params.id));
}

export default function TeaSessionPage(props: Route.ComponentProps) {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const session = props.loaderData;
	const tea = session.tea;
	const [editMode, setEditMode] = useState("1" === searchParams.get("edit"));
	const [showNodeEditor, setShowNodeEditor] = useState(false);
	const [noteValue, setNoteValue] = useState(session.note);
	const sessionMutations = useSessionMutations(session.id);
	const isAuthor = useIsAuthor(session.author);
	const member = useMember({
		iri: typeof session.author === "string" ? session.author : (session.author ?? {})["@id"],
	});

	function handleNoteChange(e: ChangeEvent<HTMLTextAreaElement>) {
		setNoteValue(e.currentTarget.value);
	}

	function toggleEditMode() {
		if (editMode && "1" === searchParams.get("edit")) {
			setSearchParams((st) => Object.fromEntries(Object.entries(st).filter(([k]) => "edit" !== k)), {
				replace: true,
			});
			setEditMode(false);
			return;
		}

		setEditMode((st) => !st);
	}

	return (
		<WithMainMenu className="px-4 pb-24 bg-green-50" activeKey="activity">
			<header className="py-4 relative">
				<div className="absolute inset-x-0 top-4 flex items-center mb-6">
					<BackButton className="mr-auto shadow-xs" />

					<IfAuthor author={session.author}>
						<nav>
							<Options session={props.loaderData} />

							<FloatingActions className="justify-center">
								<button
									className={clsx(
										"btn btn-lg rounded-full btn-primary shadow-lg",
										!editMode && "btn-outline bg-white",
									)}
									onClick={toggleEditMode}
								>
									{editMode ? <Check className="size-4" /> : <Edit className="size-4" />}
									{editMode ? "Done" : "Edit"}
								</button>
							</FloatingActions>
						</nav>
					</IfAuthor>
				</div>

				<div className="text-center text-green-900 mt-2.5 mb-8">
					<div className="text-xl font-header font-bold">
						{intlFormat(session.drankAt, { dateStyle: "long" })}
					</div>

					<div className="flex items-center justify-center gap-2 mt-2">
						{!!session.author && (
							<Link to={`/members/${extractId(session.author)}`}>
								<Badge loading={member.isLoading}>@{member.data?.username}</Badge>
							</Link>
						)}
					</div>
				</div>

				<TeaCard
					family={tea.family}
					type={tea.type}
					origin={tea.originPath}
					cultivar={tea.cultivar}
					year={tea.year}
					roast={tea.roast && RoastLevelEnum.No !== tea.roast ? tea.roast : undefined}
					business={tea.business}
					onClick={() => navigate(getTeaPageLink(session, isAuthor))}
					className="shadow bg-white my-2 overflow-hidden"
				>
					<ul className="flex items-stretch justify-center gap-x-8 text-green-700 text-base py-4">
						{!!session.teaQuantity && (
							<li>
								<SpecBadge
									label={<>{session.teaQuantity}&nbsp;g</>}
									icon={<Leaf className="size-4 text-green-700" />}
								/>
							</li>
						)}

						{!!session.waterMl && (
							<li>
								<SpecBadge
									label={<>{session.waterMl}&nbsp;ml</>}
									icon={<WaterDrop className="size-4 text-green-700" />}
								/>
							</li>
						)}

						{undefined !== session.quality && (
							<li>
								<SpecBadge
									label={`${QualityLabel[session.quality]} brew`}
									icon={QualityIcon[session.quality]}
								/>
							</li>
						)}
					</ul>
				</TeaCard>
			</header>

			<div className="mb-12">
				{!!session.note && (
					<div className="my-6">
						<h2 className="flex text-green-800/70 mb-3">
							<span>Tasting note</span>
							{editMode && (
								<IfAuthor author={session.author}>
									<button
										className="ml-auto py-2 -my-2 flex items-center text-info"
										onClick={handleUIEvent(() => setShowNodeEditor(true))}
									>
										<PencilSquare className="size-3 inline mr-2" version="micro" /> Edit
									</button>
								</IfAuthor>
							)}
						</h2>

						<p className="leading-normal text-lg text-green-900 bg-green-100 rounded-lg p-4 pt-3">
							{nl2br(session.note)}
						</p>
					</div>
				)}

				<IfAuthor author={session.author}>
					{!session.note && editMode && (
						<button
							className="btn btn-block btn-dash mt-2"
							onClick={handleUIEvent(() => setShowNodeEditor(true))}
						>
							Add a tasting note
						</button>
					)}
				</IfAuthor>
			</div>

			{!!session.steeps?.length && <h2 className="text-green-800/70 mb-3">Steeps</h2>}
			{(!!session.steeps?.length || editMode) && (
				<EditableSteepsList
					sessionId={session.id}
					author={session.author}
					steeps={session.steeps ?? []}
					className="mb-12"
					readonly={!editMode}
					onChange={async (steeps) => await sessionMutations.edit.mutateAsync({ steeps })}
				/>
			)}

			{editMode && (
				<IfAuthor author={session.author}>
					<h2 className="uppercase text-xs text-base-content/60 mb-2">Brewing quality</h2>
					<BrewingQualityInput
						onChange={async (quality) => {
							await sessionMutations.edit.mutateAsync({ quality });
						}}
						value={session.quality}
					/>
				</IfAuthor>
			)}

			<Modal onClose={() => setShowNodeEditor(false)} open={editMode && showNodeEditor}>
				<div className="flex mb-2">
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

				<textarea className="textarea w-full h-96" onChange={handleNoteChange} value={noteValue} />
			</Modal>
		</WithMainMenu>
	);
}

function getTeaPageLink(session: Pick<TeaSession, "tea" | "collectionTea">, isAuthor: boolean): string {
	if(!isAuthor || !session.collectionTea) {
		return  `/tea/${session.tea.id}`;
	}

	return session.collectionTea.slice(4); // Remove "/api" prefix
}

function SpecBadge(props: { label: ReactNode; icon: ReactNode; className?: string }) {
	return (
		<div className={clsx("flex items-center justify-center text-center", props.className)}>
			<span className="mr-2">{props.icon}</span>
			<span>{props.label}</span>
		</div>
	);
}

function useSessionMutations(sessionId: number) {
	const revalidatePage = useRevalidator();
	const navigate = useNavigate();
	const alert = useAlert();

	const editMutation = useMutation({
		mutationFn: async (
			args: NullablePartial<
				Pick<TeaSession, "note" | "quality" | "teaQuantity" | "waterMl" | "steeps"> & { place: Iri | null }
			>,
		) => {
			const response = await patchApi<TeaSessionRaw>(`/tea_sessions/${sessionId}`, {
				...args,
				steeps: args.steeps?.map((steep) => ({
					duration: steep.duration.totalSeconds,
					temperature: steep.temperature?.deg,
				})),
			});
			return denormalizeTeaSession(await response.json());
		},
		onError: (e) => alert({ title: "Failed to change this session", body: e.message }),
		onSuccess: () => revalidatePage.revalidate(),
	});

	const deleteMutation = useMutation({
		mutationFn: async () => await deleteApi(`/tea_sessions/${sessionId}`),
		onSuccess: () => navigate("/sessions"),
		onError: (e) => alert({ title: "Failed to delete this session", body: e.message }),
	});

	return { edit: editMutation, delete: deleteMutation };
}

function Options(props: { session: TeaSession }) {
	const [modalKey, setModalKey] = useState<"menu" | "params" | null>(null);
	const popup = usePopup();
	const mutation = useSessionMutations(props.session.id);

	function deleteSession() {
		popup.confirm({ body: "Are you sure you want to delete this session?" }).then(() => mutation.delete.mutate());
	}

	async function updateBrewParams(tea: number | undefined, water: number | undefined) {
		await mutation.edit.mutateAsync({ teaQuantity: tea ? tea : null, waterMl: water ? water : null });
		setModalKey(null);
	}

	return (
		<>
			<button
				className="btn btn-lg bg-white btn-circle shadow-xs"
				aria-label="Options"
				onClick={() => setModalKey("menu")}
			>
				<MoreVert className="size-6" />
			</button>
			<MenuModal onClose={() => setModalKey(null)} open={"menu" === modalKey}>
				<MenuItem label="Close" onClick={() => setModalKey(null)} icon={<Xmark className="size-5" />} />
				<MenuItem
					label="Change brewing parameters"
					onClick={() => setModalKey("params")}
					icon={<CoffeeCup className="size-5" />}
				/>
				<MenuItem
					label="Delete this session"
					onClick={deleteSession}
					icon={<Trash className="size-5" />}
					danger
				/>
			</MenuModal>

			<Modal open={"params" === modalKey} onClose={() => setModalKey(null)} className="p-0">
				<ParametersInput
					onConfirm={updateBrewParams}
					defaultWater={props.session.waterMl}
					defaultTea={props.session.teaQuantity}
					confirmLabel="Confirm"
				/>
			</Modal>
		</>
	);
}
