import type { Cultivar, Iri } from "~t/types";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { f } from "~/utils/function";
import { If } from "~/shared/components/Logical/If";
import { DashedButton, SecondaryButton } from "~/shared/components/Button";
import { SelectItem } from "~/catalog/components/CreateTeaModal/SelectItem";
import { SearchTextInput } from "~/catalog/components/SearchTextInput";
import { type IForm, makeCreateCultivarMutation } from "~/catalog/mutation/createCultivarMutation";
import { makeCultivarInfiniteOpt } from "~/catalog/query/cultivarQuery";
import { CreateCultivarModal } from "~/catalog/components/cultivar/CreateCultivarModal";

// Un-persisted version of a new origin
export type NewCultivar = IForm;

export type CreationMode = {
	// Persist immediatly the origin through api
	persist?: boolean;
	onCreated?: (cultivar: NewCultivar | Cultivar) => void;
};

export function CultivarSelect(
	props: {
		value?: Iri | NewCultivar;
		onChange: (value?: Iri) => void;
		allowToggle?: boolean;
		allowCreate?: boolean;
		className?: string;
	} & CreationMode,
) {
	const [search, setSearch] = useState<string | undefined>("");
	const [creating, setCreating] = useState<string | boolean>(false);

	const searchQuery = useInfiniteQuery(makeCultivarInfiniteOpt({ q: search }));
	const mutation = useMutation({
		...makeCreateCultivarMutation(),
		onSuccess: (cultivar) => f(props.onCreated)(cultivar),
	});

	const queryPages = searchQuery.data?.pages ?? [];
	const total = queryPages[0]?.totalItems ?? 0;

	function selectCultivar(cultivar: Cultivar) {
		if (props.allowToggle && props.value === cultivar["@id"]) {
			props.onChange(undefined);
			return;
		}

		if (cultivar["@id"] === props.value) {
			return;
		}

		props.onChange(cultivar["@id"]);
	}

	async function handleSubmitNewCultivar(data: NewCultivar) {
		if (!creating) {
			return;
		}

		if (props.persist) {
			await mutation.mutateAsync(data);
			setCreating(false);
			return;
		}

		f(props.onCreated)(data);
		setCreating(false);
	}

	return (
		<div className={props.className}>
			<SearchTextInput onChange={setSearch} defaultValue={search} />

			{props.value && typeof props.value !== "string" && (
				<div className="my-6 pb-6 border-b border-green-200">
					<h3 className="text-xl font-header mb-2">New cultivar</h3>
					<SelectItem label={props.value.name} onClick={() => props.onChange(undefined)} selected />
				</div>
			)}

			<p className="mt-6 mb-2 text-xs text-stone-500 uppercase">
				{searchQuery.isLoading && <span className="inline-block skeleton h-3 w-16" />}
				{!searchQuery.isLoading && <span>{total} cultivars</span>}
			</p>

			<ul className="flex-1 flex flex-col gap-2 overflow-y-auto">
				{searchQuery.isError && <p className="text-center">The search failed...</p>}

				{searchQuery.isLoading && (
					<Fragment>
						<li className="skeleton h-14 rounded-xl" />
						<li className="skeleton h-14 rounded-xl" />
						<li className="skeleton h-14 rounded-xl" />
						<li className="skeleton h-14 rounded-xl" />
						<li className="skeleton h-14 rounded-xl" />
						<li className="skeleton h-14 rounded-xl" />
						<li className="skeleton h-14 rounded-xl" />
						<li className="skeleton h-14 rounded-xl" />
						<li className="skeleton h-14 rounded-xl" />
					</Fragment>
				)}

				{queryPages.map((page) =>
					page.member.map((cultivar) => (
						<li key={cultivar.id}>
							<SelectItem
								label={cultivar.name}
								selected={cultivar["@id"] === props.value}
								onClick={() => selectCultivar(cultivar)}
							/>
						</li>
					)),
				)}

				{searchQuery.hasNextPage && (
					<SecondaryButton onClick={searchQuery.fetchNextPage} disabled={searchQuery.isLoading}>
						Load more
					</SecondaryButton>
				)}
			</ul>

			<If check={props.allowCreate && !searchQuery.hasNextPage}>
				<div className="mt-8 flex flex-col gap-2">
					<DashedButton className="w-full h-15" onClick={() => setCreating(true)}>
						Add a cultivar
					</DashedButton>
				</div>

				<CreateCultivarModal
					open={!!creating}
					onClose={() => setCreating(false)}
					onConfirm={handleSubmitNewCultivar}
				/>
			</If>
		</div>
	);
}
