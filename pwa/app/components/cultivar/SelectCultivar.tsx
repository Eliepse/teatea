import { PageLayout } from "~/components/shared/paged/PageLayout";
import { type ApiCollection, type Cultivar } from "~t/types";
import { type ChangeEvent, useCallback, useState } from "react";
import clsx from "clsx";
import { handleUIEvent } from "~/utils/function";
import Arrow from "~/components/icons/arrow";
import { ArrowRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getApi, postApi } from "~/utils/api";
import { Modal } from "~/components/shared/modal/Modal";
import { useAlert } from "~/components/shared/modal/AlertManager";

export function SelectCultivar(props: {
	onBack: () => void;
	onSelect: (value: Cultivar) => void;
	onCreate?: () => void;
	onSkip?: () => void;
	defaultValue?: Cultivar;
}) {
	const {
		data: collection,
		isPending,
		...query
	} = useQuery({
		queryFn: async () => await (await getApi<ApiCollection<Cultivar>>("/cultivars")).json(),
		queryKey: ["cultivars"],
	});
	const [selected, setSelected] = useState(props.defaultValue);
	const hasTypes = !isPending && 0 < (collection?.member?.length ?? 0);

	function toggleCultivar(type: Cultivar) {
		setSelected((st) => (st === type ? undefined : type));
	}

	function confirm() {
		if (undefined === selected) {
			return;
		}

		props.onSelect(selected);
	}

	const cultivarCreated = useCallback((c: Cultivar) => {
		setSelected(c);
		void query.refetch();
	}, []);

	return (
		<PageLayout
			title="Can you precise the cultivar?"
			onBack={props.onBack}
			bodyClassName="pb-4"
			action={
				<button
					className="ml-auto btn btn-primary"
					onClick={handleUIEvent(confirm)}
					disabled={!selected || isPending}
				>
					Next
					<Arrow direction="right" className="size-4 ml-1" />
				</button>
			}
		>
			{props.onSkip && (
				<button
					className="btn btn-block btn-outline btn-secondary justify-between h-12"
					onClick={handleUIEvent(props.onSkip)}
				>
					I don't know <ArrowRightIcon className="size-4" />
				</button>
			)}

			<hr className="my-4 border-slate-200" />

			{!hasTypes && <p className="py-4 text-center italic text-base-content/60">No cultivars found</p>}

			{isPending && (
				<div className="mb-8">
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
				</div>
			)}

			{collection?.member?.map((cultivar) => (
				<TypeItem
					key={cultivar.id}
					label={cultivar.name}
					onClick={() => toggleCultivar(cultivar)}
					selected={selected?.id === cultivar.id}
				/>
			))}

			{props.onCreate && <CreateCultivarButton onCultivarCreated={cultivarCreated} />}
		</PageLayout>
	);
}

function TypeItem(props: { label: string; onClick: () => void; selected?: boolean; isPDO?: boolean }) {
	return (
		<button
			onClick={handleUIEvent(props.onClick)}
			className={clsx("mb-2 btn btn-block h-12 justify-start font-normal", props.selected && "btn-primary")}
		>
			{props.label}
			{props.isPDO && <span className="ml-auto text-sm italic text-base-content/60">Protected origin</span>}
		</button>
	);
}

function CreateCultivarButton(props: { onCultivarCreated: (value: Cultivar) => void }) {
	const limit = 32;
	const [isCreating, setIsCreating] = useState(false);
	const alert = useAlert();
	const [name, setName] = useState("");

	const create = useMutation({
		mutationFn: async (name: string) => await (await postApi<Cultivar>("/cultivars", { name })).json(),
		onSuccess: (cultivar) => {
			props.onCultivarCreated(cultivar);
			setIsCreating(false);
		},
		onError: (e) => {
			alert({ title: "Failed to create the cultivar", body: e.message });
		},
	});

	const isValid = 3 <= name.length && 32 >= name.length;

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		const value = e.currentTarget.value;
		// Remove any non-word character (supports all languages) and extra spaces
		setName(
			value
				.replaceAll(/[^\p{L}_\-0-9 ]/giu, "")
				.replaceAll(/\s+/g, " ")
				.substring(0, limit),
		);
	}

	function submit() {
		if (false === isValid) {
			return;
		}

		create.mutate(name);
	}

	return (
		<>
			<button className="btn btn-block btn-dash justify-between h-12 mt-4" onClick={() => setIsCreating(true)}>
				Add a new cultivar <PlusIcon className="size-4" />
			</button>

			<Modal onClose={() => setIsCreating(false)} open={isCreating}>
				<div className="flex justify-between mb-6">
					<button className="btn">Cancel</button>
					<button
						className="btn btn-primary"
						disabled={!isValid || create.isPending}
						onClick={handleUIEvent(submit)}
					>
						{create.isPending ? "Saving..." : "Create"}
					</button>
				</div>

				<fieldset className="fieldset">
					<legend className="fieldset-legend">Cultivar name</legend>
					<input
						type="text"
						className="input"
						value={name}
						onChange={handleChange}
						minLength={3}
						maxLength={limit}
					/>
					<p className="label">Use latin/international version if possible</p>
				</fieldset>
			</Modal>
		</>
	);
}
