import type { Route } from "../../../.react-router/types/app/pages/member/+types/personal-collection-tea";
import { deleteApi, getApi, patchApi } from "~/utils/api";
import { type CollectionTeaRaw, denormalizeCollectionTea } from "~/utils/api/normalization/collectionTea";
import { BackButton } from "~/components/shared/navigation/BackButton";
import { AuthLayout } from "~/layouts/AuthLayout";
import { TeaCard } from "~/components/tea/TeaCard";
import { Calendar, Shop, Trash } from "iconoir-react";
import type { CollectionTea, Iri, NullablePartial } from "~t/types";
import { useState } from "react";
import { MenuItem, MenuModal } from "~/components/shared/navigation/MenuModal";
import { Modal } from "~/components/shared/modal/Modal";
import { SelectBusinessFrame } from "~/components/teaSession/create/SelectBusinessFrame";
import { MenuButton } from "~/components/shared/navigation/MenuModalButton";
import { useMutation } from "@tanstack/react-query";
import { extractId } from "~/utils/resource";
import { useNavigate, useRevalidator } from "react-router";
import { useAlert, usePopup } from "~/components/shared/modal/AlertManager";
import { DatePickerStep } from "~/components/shared/form/modal-multistep/DatePickerStep";
import { jsonableDate } from "~/utils/time";

export async function clientLoader(args: Route.ClientLoaderArgs) {
	const response = await getApi<CollectionTeaRaw>(`/members/${args.params.username}/teas/${args.params.teaId}`);
	const ctea = denormalizeCollectionTea(await response.json());
	return { ctea };
}

export default function PersonalCollectionTeaPage(props: Route.ComponentProps) {
	const { tea, ...meta } = props.loaderData.ctea;

	return (
		<AuthLayout activeKey="my-teas" className="p-4 pb-20 bg-green-50 min-h-dvh">
			<nav className="mb-4 pt-2 relative flex">
				<BackButton className="mr-auto shadow-sm" />
				<OptionsMenu collectionTea={props.loaderData.ctea} />
			</nav>

			{/*<div*/}
			{/*	className={clsx(*/}
			{/*		"mb-4 flex items-center justify-center h-32 rounded-xl",*/}
			{/*		"bg-white/40 border-2 border-green-800/60 border-dashed",*/}
			{/*		"cursor-pointer hover:bg-white/70 hover:border-green-800",*/}
			{/*	)}*/}
			{/*>*/}
			{/*	<MediaImagePlus className="size-6 text-green-700" />*/}
			{/*</div>*/}

			<TeaCard
				family={tea.family}
				cultivar={tea.cultivar}
				roast={tea.roast}
				type={tea.type}
				year={tea.year}
				origin={tea.origin}
				className="bg-white shadow-xs"
				hideArrow
			>
				<ul className="flex justify-around rounded-xl py-4 text-green-900">
					{meta.acquiredFrom && (
						<li className="flex items-center gap-2">
							<Shop className="size-4" />
							{meta.acquiredFrom.name}
						</li>
					)}
					{meta.acquiredAt && (
						<li className="flex items-center gap-2">
							<Calendar className="size-4" />
							{meta.acquiredAt.toLocaleDateString()}
						</li>
					)}
				</ul>
			</TeaCard>
		</AuthLayout>
	);
}

function OptionsMenu(props: { collectionTea: CollectionTea }) {
	const revalidatePage = useRevalidator();
	const alert = useAlert();
	const popup = usePopup();
	const navigate = useNavigate();
	const [modalKey, setModalKey] = useState<"_menu" | "acquiredFrom" | "acquiredAt" | null>(null);

	const mutation = useMutation({
		mutationFn: async (args: NullablePartial<Pick<CollectionTea, "acquiredAt"> & { acquiredFrom: Iri }>) => {
			const response = await patchApi<CollectionTeaRaw>(props.collectionTea["@id"], args);
			return denormalizeCollectionTea(await response.json());
		},
		onError: (e) => alert({ title: "Failed to change this tea", body: e.message }),
		onSuccess: () => revalidatePage.revalidate(),
	});

	const deleteMutation = useMutation({
		mutationFn: async () => await deleteApi(props.collectionTea["@id"]),
		onSuccess: () => navigate(`/members/${extractId(props.collectionTea.owner)}/teas`),
		onError: (e) => alert({ title: "Failed to delete this tea", body: e.message }),
	});

	function deleteSession() {
		popup.confirm({ body: "Are you sure you want to delete this session?" }).then(() => deleteMutation.mutate());
	}

	async function patchResource(patch: Parameters<typeof mutation.mutateAsync>[0]) {
		await mutation.mutateAsync(patch);
		setModalKey(null);
	}

	return (
		<>
			<MenuButton onClick={() => setModalKey("_menu")} />
			<MenuModal onClose={() => setModalKey(null)} open={"_menu" === modalKey}>
				<MenuItem
					label="Change shop"
					onClick={() => setModalKey("acquiredFrom")}
					icon={<Shop className="size-5" />}
				/>
				<MenuItem
					label="Change acquisition date"
					onClick={() => setModalKey("acquiredAt")}
					icon={<Calendar className="size-5" />}
				/>
				<MenuItem
					label="Delete this session"
					onClick={deleteSession}
					icon={<Trash className="size-5" />}
					danger
				/>
			</MenuModal>

			<Modal
				open={"acquiredFrom" === modalKey}
				onClose={() => setModalKey(null)}
				position="bottom"
				className="p-0"
			>
				<SelectBusinessFrame
					onConfirm={(iri) => patchResource({ acquiredFrom: iri ?? null })}
					defaultValue={props.collectionTea.acquiredFrom?.["@id"]}
					confirmLabel="Confirm"
				/>
			</Modal>

			<Modal open={"acquiredAt" === modalKey} onClose={() => setModalKey(null)} position="bottom" className="p-0">
				<DatePickerStep
					onNext={(date) => patchResource({ acquiredAt: jsonableDate(date) })}
					defaultValue={props.collectionTea.acquiredAt}
					allowEmpty
				/>
			</Modal>
		</>
	);
}
