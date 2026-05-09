import type { Route } from "../../../.react-router/types/app/account/pages/+types/my-teas-item";
import { getApi, postApi } from "~/utils/api";
import { type CollectionTeaRaw, denormalizeCollectionTea } from "~/utils/api/normalization/collectionTea";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { WithMainMenu } from "~/layouts/WithMainMenu";
import {
	ArrowRightCircle,
	Calendar,
	CalendarPlus,
	GlassEmpty,
	MediaImage,
	MediaImagePlus,
	MoreVert,
	Shop,
	Trash,
} from "iconoir-react";
import type { CollectionTea, Cultivar, Origin, RoastLevel } from "~t/types";
import { type ChangeEvent, type ReactNode, useMemo, useState } from "react";
import { MenuItem, MenuModal } from "~/components/shared/navigation/MenuModal";
import { Modal } from "~/components/shared/modal/Modal";
import { SelectBusinessFrame } from "~/components/teaSession/create/SelectBusinessFrame";
import { MenuButton } from "~/components/shared/navigation/MenuModalButton";
import { Link, useNavigate, useRevalidator } from "react-router";
import { useAlert, usePopup } from "~/components/shared/modal/AlertManager";
import { DatePickerStep } from "~/components/shared/form/modal-multistep/DatePickerStep";
import { jsonableDate } from "~/utils/time";
import { TextStep } from "~/components/shared/form/modal-multistep/TextStep";
import { useCollectionTeaMutations } from "~/hooks/tea/useCollectionTeaMutations";
import { extractId } from "~/utils/resource";
import { EditableDescription } from "~/account/components/EditableDescription";
import clsx from "clsx";
import { Family } from "~/components/tea/Family";
import { FormatOrigin } from "~/components/shared/FormatOriginPath";
import { type MemberTeaContext, MemberTeaCTX, useCollectionTeaContext } from "~/account/components/MemberTeaContext";
import { Badge } from "~/components/shared/Badge";
import { TeaRatingInput } from "~/components/shared/TeaRatingInput";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const response = await getApi<CollectionTeaRaw>(`/members/${args.params.username}/teas/${args.params.teaId}`);
	const ctea = denormalizeCollectionTea(await response.json());
	return { ctea };
}

export default function PersonalCollectionTeaPage(props: Route.ComponentProps) {
	const alert = useAlert();
	const revalidatePage = useRevalidator();
	const { tea, ...meta } = props.loaderData.ctea;
	const mutations = useCollectionTeaMutations(meta["@id"]);
	const [action, setAction] = useState<Parameters<MemberTeaContext["act"]>[0] | undefined>();
	const [uploading, setUploading] = useState(false);

	async function patchResource(patch: Parameters<typeof mutations.patch.mutateAsync>[0]) {
		await mutations.patch.mutateAsync(patch);
		await revalidatePage.revalidate();
		setAction(undefined);
	}

	const context = useMemo<MemberTeaContext>(
		() => ({
			item: props.loaderData.ctea,
			act: (action) => setAction(action),
		}),
		[props.loaderData.ctea],
	);

	function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.item(0);

		if (!file) {
			return;
		}

		setUploading(true);

		postApi(`${meta["@id"]}/media`, { file })
			.then(() => revalidatePage.revalidate())
			.catch((e) => alert({ title: "Failed to upload the image", body: e.message }))
			.finally(() => setUploading(false));
	}

	return (
		<WithMainMenu activeKey="my-teas" className="p-4 pb-20 bg-green-50 min-h-dvh">
			<MemberTeaCTX.Provider value={context}>
				<nav className="mb-6 pt-2 relative flex">
					<BackButton className="mr-auto shadow-sm" />
					<OptionsMenu collectionTea={props.loaderData.ctea} />
				</nav>

				<header>
					{!meta.thumbnail && (
						<label
							className={clsx(
								"mb-4 flex items-center justify-center h-32 rounded-xl",
								"bg-white/40 border-2 border-green-800/60 border-dashed",
								"cursor-pointer hover:bg-white/70 hover:border-green-800",
							)}
						>
							<input type="file" accept="image/*" onChange={handleFileUpload} hidden />
							<MediaImagePlus className="size-6 text-green-700" />
						</label>
					)}

					{meta.thumbnail && (
						<div className="relative">
							<img
								src={meta.thumbnail.contentUrl}
								style={{ backgroundImage: `url(data:image/webp;base64,${meta.thumbnail.placeholder})` }}
								className="mb-4 w-full h-48 rounded-xl object-cover bg-center bg-cover z-0"
								alt=""
							/>

							<label
								className={clsx(
									"flex items-center justify-center h-10 w-10 absolute bottom-2 right-2 z-10",
									"bg-white/60 rounded-full cursor-pointer hover:bg-white",
								)}
							>
								<MediaImagePlus className="size-6 text-green-700" />
								<input type="file" accept="image/*" onChange={handleFileUpload} hidden />
							</label>
						</div>
					)}

					<div className="">
						{!!tea.type && <Family family={tea.family} className="capitalize text-teal-800 mb-1" />}

						<Link to={`/tea/${tea.id}`}>
							<h1 className="font-header font-bold text-4xl text-green-800">
								{!tea.type ? `${tea.family} tea` : tea.type.name}
								<ArrowRightCircle className="inline ml-3 size-5 opacity-70" />
							</h1>
						</Link>
					</div>

					<SpecList
						cultivar={tea.cultivar}
						roast={tea.roast}
						year={tea.year}
						origin={tea.origin}
						className="text-stone-500"
					/>

					<ul className="my-4 flex flex-wrap gap-2">
						{!!meta.acquiredFrom && (
							<li>
								<Badge icon={<Shop className="size-4" />}>{meta.acquiredFrom.name}</Badge>
							</li>
						)}

						{!!meta.acquiredAt && (
							<li>
								<Badge icon={<CalendarPlus className="size-4" />}>
									{meta.acquiredAt.toLocaleDateString()}
								</Badge>
							</li>
						)}
					</ul>

					{!!meta.finishedAt && (
						<div className="bg-white grid gap-2 rounded-lg px-4 py-4 my-4 text-green-900 shadow-xs">
							<p>You finished this tea on {meta.finishedAt.toLocaleDateString()}</p>
						</div>
					)}
				</header>

				<TeaRatingInput
					value={meta.rating}
					onChange={(rating) => patchResource({ rating })}
					className="my-8 justify-center"
					readonly={mutations.patch.isPending}
				/>

				<EditableDescription collTeaIri={meta["@id"]} value={meta.description} className="my-4" />

				<Modal open={undefined !== action} onClose={() => setAction(undefined)} className="p-0">
					{"edit:acquiredFrom" === action && (
						<SelectBusinessFrame
							onConfirm={(iri) => patchResource({ acquiredFrom: iri ?? null })}
							defaultValue={meta.acquiredFrom?.["@id"]}
							confirmLabel="Confirm"
							allowCreate
						/>
					)}

					{"edit:acquiredAt" === action && (
						<DatePickerStep
							onNext={(date) => patchResource({ acquiredAt: jsonableDate(date) })}
							defaultValue={meta.acquiredAt}
							allowEmpty
						/>
					)}

					{"edit:finishedAt" === action && (
						<DatePickerStep
							onNext={(date) => patchResource({ finishedAt: jsonableDate(date) })}
							defaultValue={meta.finishedAt}
							allowEmpty
						/>
					)}

					{"edit:description" === action && (
						<div className="p-4">
							<TextStep
								onConfirm={(text) => patchResource({ description: text })}
								defaultValue={meta.description}
								allowEmpty
							/>
						</div>
					)}
				</Modal>

				<Modal open={uploading} className="h-1/3">
					<div className="flex items-center justify-center h-full text-lg text-green-700 py-16">
						<div>
							<MediaImage className="mx-auto mb-4 size-10 animate-bounce text-green-600" />
							<span className="ml-2 font-medium">Uploading the image...</span>
						</div>
					</div>
				</Modal>
			</MemberTeaCTX.Provider>
		</WithMainMenu>
	);
}

function SpecList(props: {
	origin?: Pick<Origin, "namePath">;
	cultivar?: Pick<Cultivar, "name">;
	year?: number;
	roast?: RoastLevel;
	className?: string;
}) {
	const items = new Map<string, ReactNode>();

	if (props.origin) {
		items.set("origin", <FormatOrigin origin={props.origin} />);
	}

	if (props.cultivar) {
		items.set("cultivar", props.cultivar.name);
	}

	if (props.year) {
		items.set("year", props.year);
	}

	if (props.roast) {
		items.set("roast", props.roast);
	}

	if (0 === items.size) {
		return null;
	}

	return (
		<ul className={clsx("flex flex-wrap", props.className)}>
			{Array.from(items.entries()).map(([key, child], i) => (
				<li key={key}>
					{child}
					{i + 1 < items.size && <span className="mx-2">&middot;</span>}
				</li>
			))}
		</ul>
	);
}

function OptionsMenu(props: { collectionTea: CollectionTea }) {
	const context = useCollectionTeaContext();
	const popup = usePopup();
	const navigate = useNavigate();
	const mutations = useCollectionTeaMutations(props.collectionTea["@id"]);
	const [modalKey, setModalKey] = useState<"_menu" | null>(null);

	function deleteSession() {
		popup.confirm({ body: "Are you sure you want to delete this session?" }).then(async () => {
			await mutations.delete.mutateAsync();
			navigate(`/members/${extractId(props.collectionTea.owner)}/teas`);
		});
	}

	return (
		<>
			<MenuButton onClick={() => setModalKey("_menu")} icon={<MoreVert className="size-6" />} />
			<MenuModal onClose={() => setModalKey(null)} open={"_menu" === modalKey}>
				<MenuItem
					label="Change shop"
					onClick={() => {
						context?.act("edit:acquiredFrom");
						setModalKey(null);
					}}
					icon={<Shop className="size-5" />}
				/>
				<MenuItem
					label="Change acquisition date"
					onClick={() => {
						context?.act("edit:acquiredAt");
						setModalKey(null);
					}}
					icon={<Calendar className="size-5" />}
				/>
				<MenuItem
					label="Mark as finished"
					onClick={() => {
						context?.act("edit:finishedAt");
						setModalKey(null);
					}}
					icon={<GlassEmpty className="size-5" />}
				/>
				<MenuItem
					label="Delete this session"
					onClick={deleteSession}
					icon={<Trash className="size-5" />}
					danger
				/>
			</MenuModal>
		</>
	);
}
