import { PageLayout } from "~/components/shared/paged/PageLayout";
import { type ApiCollection, type Origin, type TreePath } from "~t/types";
import { type ChangeEvent, useState } from "react";
import clsx from "clsx";
import Chevron from "~/components/icons/chevron";
import { ArrowRightIcon, CheckIcon, PlusIcon } from "@heroicons/react/24/outline";
import { handleUIEvent } from "~/utils/function";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getApi, postApi } from "~/utils/api";
import { getOriginLevel, getParentPath, useOrigin } from "~/utils/api/useOrigins";
import { useAlert } from "~/components/shared/modal/AlertManager";
import { Modal } from "~/components/shared/modal/Modal";
import { makePopularOriginQueryOpt } from "~/shared/query/originQuery";

export function SelectOrigin(props: {
	onBack: () => void;
	defaultOriginPath?: Origin["path"];
	allowCreation?: boolean;
	allowSkip?: boolean;
	allowToggle?: boolean;
	onSelect: (value?: Origin) => void;
}) {
	// Path of the parent of the displayed origins
	const [viewPath, setViewPath] = useState(getParentPath(props.defaultOriginPath));
	const { data: viewOrigin, ...viewOriginQuery } = useOrigin(viewPath);
	const viewOriginLevel = viewOrigin?.path?.split(".")?.length ?? 0;

	// Path of the currently selected origin
	const [selectionPath, setSelectionPath] = useState(props.defaultOriginPath);
	const { data: origins, ...listQuery } = useQuery({
		queryFn: async (ctx) => {
			const queryKey = ctx.queryKey[1] ?? null;
			const params = typeof queryKey === "string" ? { parent: undefined } : queryKey;
			const parentLevel = params.parent?.split(".")?.length ?? 0;

			const filters = {
				parent: params.parent,
				// Fetch children, but never lower than localities
				level: Math.min(parentLevel + 1, 3),
			};

			const data = await (await getApi<ApiCollection<Origin>>("/origins", filters)).json();
			return data.member;
		},
		queryKey: ["origins", { parent: viewPath }],
	});
	const selectedOrigin = origins?.find((o) => o.path === selectionPath);

	function back() {
		if (undefined === viewPath) {
			props.onBack();
			return;
		}

		setSelectionPath(undefined);
		setViewPath((st) => {
			const parentNodes = st?.split(".")?.slice(0, -1) ?? [];
			return 0 === parentNodes.length ? undefined : parentNodes.join(".");
		});
	}

	function changeSelection(origin: Origin): void {
		setSelectionPath((st) => (props.allowToggle && origin.path === st ? undefined : origin.path));
		setViewPath((st) => {
			if (origin.isLeaf) {
				return st;
			}

			return origin.path;
		});
	}

	function confirm() {
		let selected = origins?.find((o) => o.path === selectionPath);

		// If the selection is the current view (the parent of displayed list)
		if (viewOrigin && !selected && viewOrigin.path === selectionPath) {
			selected = viewOrigin;
		}

		if (true === props.allowToggle) {
			props.onSelect(selected);
			return;
		}

		if (!selected) {
			console.warn("Can't submit: no origin selected!");
			return;
		}

		props.onSelect(selected);
	}

	return (
		<PageLayout
			title="Where does it come from?"
			onBack={back}
			bodyClassName="pb-20"
			action={
				<button
					className="ml-auto btn btn-primary"
					onClick={confirm}
					disabled={true !== props.allowToggle && !selectionPath}
				>
					Next
					<ArrowRightIcon className="size-4" />
				</button>
			}
		>
			{props.allowSkip && (
				<>
					<button
						className="btn btn-block btn-outline btn-secondary justify-between h-12 mb-4"
						onClick={handleUIEvent(() => props.onSelect(undefined))}
					>
						I don't know the origin of this tea <ArrowRightIcon className="size-4" />
					</button>
					<hr className="border-stone-200 mt-2 mb-4" />
				</>
			)}

			{undefined === viewPath && <PopularOrigins selectionPath={selectionPath} onSelect={changeSelection} />}

			{viewOriginQuery.isLoading && <div className="skeleton h-14 mb-2" />}
			{!viewOriginQuery.isLoading && viewOrigin && (
				<OriginItem
					label={viewOrigin.name}
					selected={viewOrigin.path === selectionPath}
					onSelect={() => changeSelection(viewOrigin)}
				/>
			)}

			{0 !== viewOriginLevel && (
				<div className="text-xs text-base-content/60 my-4 uppercase">
					{1 === viewOriginLevel && "Regions"}
					{2 === viewOriginLevel && "Localities"}
				</div>
			)}

			{listQuery.isLoading && (
				<>
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
				</>
			)}

			{(origins ?? []).map((origin) => (
				<OriginItem
					key={origin.path}
					label={origin.name}
					selected={selectionPath === origin.path}
					hasChildren={!origin.isLeaf}
					onSelect={() => changeSelection(origin)}
					isProposal={true === origin.proposal}
				/>
			))}

			{true === props.allowCreation && (
				<CreateOriginButton
					parent={viewOrigin}
					onOriginCreated={(o) => {
						changeSelection(o);
						void listQuery.refetch();
					}}
				/>
			)}

			{true === props.allowCreation && !!selectedOrigin && 3 > (getOriginLevel(selectedOrigin) ?? 3) && (
				<CreateOriginButton
					parent={selectedOrigin}
					onOriginCreated={(o) => {
						changeSelection(o);
						setViewPath(selectedOrigin.path);
						void listQuery.refetch();
					}}
				/>
			)}
		</PageLayout>
	);
}

function PopularOrigins(props: { selectionPath?: TreePath; onSelect: (origin: Origin) => void }) {
	const { data: popularOrigins, ...popularsQuery } = useQuery(makePopularOriginQueryOpt({ itemsPerPage: 3 }));

	return (
		<>
			<div className="text-xs text-base-content/60 mb-4 uppercase">Popular origins</div>

			{popularsQuery.isLoading ? (
				<>
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
					<div className="skeleton h-14 mb-2" />
				</>
			) : (
				(popularOrigins ?? []).map((origin) => (
					<OriginItem
						key={origin.path}
						label={origin.name}
						selected={props.selectionPath === origin.path}
						hasChildren={!origin.isLeaf}
						onSelect={() => props.onSelect(origin)}
					/>
				))
			)}

			<hr className="border-stone-200 mt-2 mb-4" />
		</>
	);
}

function OriginItem(props: {
	label: string;
	selected: boolean;
	hasChildren?: boolean;
	onSelect: () => void;
	isProposal?: boolean;
}) {
	return (
		<button
			onClick={handleUIEvent(props.onSelect)}
			className={clsx("mb-2 btn btn-block h-14", props.selected && "btn-primary")}
		>
			<span className="mr-auto">{props.label}</span>

			{props.isProposal && <em className="mr-auto font-normal">(under validation)</em>}

			{props.selected && <CheckIcon className="size-4" />}
			{props.hasChildren && <Chevron direction="right" className="size-4" />}
		</button>
	);
}

function CreateOriginButton(props: { parent?: Origin | null; onOriginCreated: (value: Origin) => void }) {
	const limit = 24;
	const [isCreating, setIsCreating] = useState(false);
	const alert = useAlert();
	const [name, setName] = useState("");
	const level = getOriginLevel(props.parent) ?? 0;
	const newLevel = 0 === level ? "country" : 1 === level ? "region" : "locality";

	const create = useMutation({
		mutationFn: async (data: { parentPath: TreePath | undefined; name: string }) => {
			return await (await postApi<Origin>("/origins", { name: data.name, parentPath: data.parentPath })).json();
		},
		onSuccess: (origin) => {
			props.onOriginCreated(origin);
			setIsCreating(false);
		},
		onError: (e) => {
			alert({ title: "Failed to create the origin", body: e.message });
		},
	});

	const isValid = 3 <= name.length && 32 >= name.length;

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		// Remove any non-word character (supports all languages) and extra spaces
		setName(
			e.currentTarget.value
				.replaceAll(/[^\p{L}_\-0-9 ]/giu, "")
				.replaceAll(/\s+/g, " ")
				.substring(0, limit),
		);
	}

	function submit() {
		if (false === isValid) {
			return;
		}

		create.mutate({ parentPath: props.parent?.path, name: name.trim() });
	}

	return (
		<>
			<button className="btn btn-block btn-dash justify-between h-12 mt-4" onClick={() => setIsCreating(true)}>
				Propose a new {props.parent && 0 !== level && props.parent.name} {newLevel}{" "}
				<PlusIcon className="size-4" />
			</button>

			<Modal onClose={() => setIsCreating(false)} open={isCreating}>
				<div className="flex justify-between mb-6">
					<button className="btn" onClick={handleUIEvent(() => setIsCreating(false))}>
						Cancel
					</button>
					<button
						className="btn btn-primary"
						disabled={!isValid || create.isPending}
						onClick={handleUIEvent(submit)}
					>
						{create.isPending ? "Saving..." : "Create"}
					</button>
				</div>

				{props.parent && (
					<fieldset className="fieldset mb-4">
						<legend className="fieldset-legend">Parent {1 === level ? "country" : "region"}</legend>
						<input type="text" className="input" value={props.parent.name} disabled />
					</fieldset>
				)}

				<fieldset className="fieldset">
					<legend className="fieldset-legend">{newLevel} name</legend>
					<input
						type="text"
						className="input"
						value={name}
						onChange={handleChange}
						minLength={3}
						maxLength={limit}
					/>
					<p className="label">Use english version</p>
				</fieldset>
			</Modal>
		</>
	);
}
