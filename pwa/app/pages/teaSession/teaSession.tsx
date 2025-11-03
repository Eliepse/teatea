import type { Route } from "../../../.react-router/types/app/pages/teaSession/+types/teaSession";
import { deleteApi, fetchApi, patchApi } from "~/utils/api";
import { BrewingQualityEnum, type Business, RoastLevelEnum, type TeaSession, type TeaType } from "~t/types";
import { denormalizeTeaSession, type TeaSessionRaw } from "~/utils/api/normalization/teaSession";
import { intlFormat } from "date-fns";
import { Link, useNavigate, useRevalidator, useSearchParams } from "react-router";
import Arrow from "~/components/icons/arrow";
import { Modal } from "~/components/shared/modal/Modal";
import { type ChangeEvent, type PropsWithChildren, type ReactNode, useState } from "react";
import { handleUIEvent } from "~/utils/function";
import { useMutation } from "@tanstack/react-query";
import { PencilSquare } from "~/components/icons/pencilSquare";
import { nl2br } from "~/utils/content";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/16/solid";
import { AuthLayout } from "~/layouts/AuthLayout";
import Leaf from "~/components/icons/leaf";
import WaterDrop from "~/components/icons/WaterDrop";
import { IfAuthor } from "~/auth/components/voters/IfAuthor";
import { EditableSteepsList } from "~/pages/teaSession/_components/EditableSteepsList";
import { BrewingQualityInput, QualityLabel } from "~/components/shared/inputs/BrewingQualityInput";
import { Check, Edit, EmojiPuzzled, EmojiSad, EmojiSatisfied, ShopFourTilesWindow } from "iconoir-react";
import clsx from "clsx";
import { useMember } from "~/utils/api/useMember";
import { BusinessSelect } from "~/components/shared/inputs/BusinessSelect";
import { useAlert } from "~/components/shared/modal/AlertManager";
import { useResourceQuery } from "~/utils/api/useResourceQuery";
import { TeaCard } from "~/components/tea/TeaCard";

const QualityIcon = {
	[BrewingQualityEnum.Good]: <EmojiSatisfied className="size-5" />,
	[BrewingQualityEnum.Improvable]: <EmojiPuzzled className="size-5" />,
	[BrewingQualityEnum.Bad]: <EmojiSad className="size-5" />,
};

export async function clientLoader(props: Route.ClientLoaderArgs): Promise<TeaSession> {
	const id = parseInt(props.params.id);
	const response = await fetchApi<TeaSessionRaw>(`/tea_sessions/${id}`);
	return denormalizeTeaSession(await response.json());
}

export default function TeaSessionPage(props: Route.ComponentProps) {
	const revalidator = useRevalidator();
	const [searchParams] = useSearchParams();
	const session = props.loaderData;
	const tea = session.tea;
	const teaType = useResourceQuery<TeaType>(tea.type);
	const [editMode, setEditMode] = useState("1" === searchParams.get("edit"));
	const [showNodeEditor, setShowNodeEditor] = useState(false);
	const [noteValue, setNoteValue] = useState(session.note);
	const sessionMutations = useSessionMutations(session.id);
	const member = useMember({
		iri: typeof session.author === "string" ? session.author : (session.author ?? {})["@id"],
	});

	function handleNoteChange(e: ChangeEvent<HTMLTextAreaElement>) {
		setNoteValue(e.currentTarget.value);
	}

	function toggleEditMode() {
		setEditMode((st) => !st);
	}

	return (
		<AuthLayout className="px-4 pb-24 bg-green-50" activeKey="activity">
			<header className="py-4 relative">
				<div className="absolute inset-x-0 top-4 flex items-center mb-6">
					<Link to="/sessions" className="btn btn-circle btn-lg bg-white mr-auto">
						<Arrow direction="left" className="size-5" />
					</Link>

					<IfAuthor author={session.author}>
						<div className="dropdown dropdown-end ml-2">
							<button className="btn btn-lg btn-circle bg-white">
								<EllipsisVerticalIcon className="size-5" />
							</button>

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

						<nav className="fixed inset-x-4 bottom-20 flex items-center justify-center z-10">
							<button
								className={clsx(
									"btn btn-lg rounded-full btn-primary",
									!editMode && "btn-outline bg-white",
								)}
								onClick={toggleEditMode}
							>
								{editMode ? <Check className="size-4" /> : <Edit className="size-4" />}
								{editMode ? "Done" : "Edit"}
							</button>
						</nav>
					</IfAuthor>
				</div>

				<div className="text-center text-green-900 mt-2.5 mb-8">
					<div className="text-xl font-header font-bold">
						{intlFormat(session.drankAt, { dateStyle: "long" })}
					</div>

					<div className="flex items-center justify-center gap-2 mt-2">
						<PlaceBadge place={session.place} />

						{!!session.author && (
							<Badge icon="" loading={member.isLoading}>
								@{member.data?.username}
							</Badge>
						)}
					</div>
				</div>

				<TeaCard
					family={tea.family}
					type={teaType.data}
					origin={tea.originPath}
					cultivar={tea.cultivar}
					year={tea.year}
					roast={tea.roast && RoastLevelEnum.No !== tea.roast ? tea.roast : undefined}
					loading={teaType.isLoading}
					className="border border-green-200 bg-white my-2 overflow-hidden"
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
			<EditableSteepsList
				sessionId={session.id}
				author={session.author}
				steeps={session.steeps ?? []}
				className="mb-12"
				readonly={!editMode}
				onChange={() => revalidator.revalidate()}
			/>

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

			{editMode && (
				<IfAuthor author={session.author}>
					<h2 className="uppercase text-xs text-base-content/60 mt-8 mb-2">Location</h2>
					<BusinessSelect
						value={props.loaderData.place ?? undefined}
						onSelect={async (place) => void sessionMutations.edit.mutateAsync({ place: place ?? null })}
						allowClear
						allowCreate
						placeholder="Search for a place"
					/>
				</IfAuthor>
			)}

			<Modal onClose={() => setShowNodeEditor(false)} open={editMode && showNodeEditor} position="bottom">
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
		</AuthLayout>
	);
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
		mutationFn: async (args: Partial<Pick<TeaSession, "note" | "quality" | "place">>) => {
			const response = await patchApi<TeaSessionRaw>(`/tea_sessions/${sessionId}`, args);
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

function Badge(props: PropsWithChildren<{ icon?: ReactNode; className?: string; loading?: boolean }>) {
	return (
		<div
			className={clsx(
				"inline-flex items-center bg-white rounded-full px-2.5 h-8 border border-green-100 whitespace-nowrap text-sm",
				props.className,
			)}
		>
			{props.icon && <span className="inline-block mr-2">{props.icon}</span>}
			{true === props.loading ? <span className="skeleton h-3 w-16" /> : props.children}
		</div>
	);
}

function PlaceBadge(props: { place?: Business["@id"] | null }) {
	const { data: place, isLoading } = useResourceQuery<Business>(props.place);

	if (!props.place) {
		return null;
	}

	return (
		<Badge icon={<ShopFourTilesWindow className="size-4" />} loading={isLoading}>
			{place?.name}
		</Badge>
	);
}
