import type { Route } from "../../../.react-router/types/app/pages/member/+types/personal-collection-tea";
import { getApi, postApi } from "~/utils/api";
import { type CollectionTeaRaw, denormalizeCollectionTea } from "~/utils/api/normalization/collectionTea";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { AuthLayout } from "~/layouts/AuthLayout";
import { Calendar, EditPencil, MediaImagePlus, Shop, Trash } from "iconoir-react";
import type { CollectionTea, Cultivar, Origin, RoastLevel } from "~t/types";
import { type ChangeEvent, type ReactNode, useMemo, useState } from "react";
import { MenuItem, MenuModal } from "~/components/shared/navigation/MenuModal";
import { Modal } from "~/components/shared/modal/Modal";
import { SelectBusinessFrame } from "~/components/teaSession/create/SelectBusinessFrame";
import { MenuButton } from "~/components/shared/navigation/MenuModalButton";
import { useNavigate, useRevalidator } from "react-router";
import { usePopup } from "~/components/shared/modal/AlertManager";
import { DatePickerStep } from "~/components/shared/form/modal-multistep/DatePickerStep";
import { jsonableDate } from "~/utils/time";
import { TextStep } from "~/components/shared/form/modal-multistep/TextStep";
import { useCollectionTeaMutations } from "~/hooks/tea/useCollectionTeaMutations";
import { extractId } from "~/utils/resource";
import { EditableDescription } from "~/pages/member/_components/EditableDescription";
import clsx from "clsx";
import { Family } from "~/components/tea/Family";
import { FormatOrigin } from "~/components/shared/FormatOriginPath";
import {
	type MemberTeaContext,
	MemberTeaCTX,
	useCollectionTeaContext,
} from "~/pages/member/_components/MemberTeaContext";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const response = await getApi<CollectionTeaRaw>(`/members/${args.params.username}/teas/${args.params.teaId}`);
	const ctea = denormalizeCollectionTea(await response.json());
	return { ctea };
}

export default function PersonalCollectionTeaPage(props: Route.ComponentProps) {
	const revalidatePage = useRevalidator();
	const { tea, ...meta } = props.loaderData.ctea;
	const mutations = useCollectionTeaMutations(meta["@id"]);
	const [action, setAction] = useState<Parameters<MemberTeaContext["act"]>[0] | undefined>();

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

		postApi(`${meta["@id"]}/media`, { file }).finally(console.debug);
	}

	return (
		<AuthLayout activeKey="my-teas" className="p-4 pb-20 bg-green-50 min-h-dvh">
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
						<img
							src={meta.thumbnail.contentUrl}
							className="mb-4 w-full h-48 rounded-xl object-cover"
							alt=""
						/>
					)}

					<div className="">
						{!!tea.type && <Family family={tea.family} className="capitalize text-teal-800 mb-1" />}

						<h1 className="font-header font-bold text-4xl text-green-800">
							{!tea.type ? `${tea.family} tea` : tea.type.name}
						</h1>
					</div>

					<SpecList
						cultivar={tea.cultivar}
						roast={tea.roast}
						year={tea.year}
						origin={tea.origin}
						className="text-stone-500"
					/>

					<div className="my-4 border-t border-green-200" />

					<ul className="my-4 text-green-900">
						{meta.acquiredFrom && (
							<li className="flex items-center gap-2 my-2">
								<Shop className="size-4" />
								{meta.acquiredFrom.name}
							</li>
						)}

						{meta.acquiredAt && (
							<li className="flex items-center gap-2 my-2">
								<Calendar className="size-4" />
								{meta.acquiredAt.toLocaleDateString()}
							</li>
						)}
					</ul>

					<div className="my-4 border-t border-green-200" />
				</header>

				<EditableDescription collTeaIri={meta["@id"]} value={meta.description} className="my-4" />

				<Modal
					open={undefined !== action}
					onClose={() => setAction(undefined)}
					position="bottom"
					className="p-0"
				>
					{"edit:acquiredFrom" === action && (
						<SelectBusinessFrame
							onConfirm={(iri) => patchResource({ acquiredFrom: iri ?? null })}
							defaultValue={meta.acquiredFrom?.["@id"]}
							confirmLabel="Confirm"
						/>
					)}

					{"edit:acquiredAt" === action && (
						<DatePickerStep
							onNext={(date) => patchResource({ acquiredAt: jsonableDate(date) })}
							defaultValue={meta.acquiredAt}
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
			</MemberTeaCTX.Provider>
		</AuthLayout>
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
			<MenuButton onClick={() => setModalKey("_menu")} icon={<EditPencil className="size-6" />} />
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
					label="Delete this session"
					onClick={deleteSession}
					icon={<Trash className="size-5" />}
					danger
				/>
			</MenuModal>
		</>
	);
}
