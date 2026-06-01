import type { Iri, TeaFamily, TeaType } from "~t/types";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { f } from "~/utils/function";
import { If } from "~/shared/components/Logical/If";
import { DashedButton, SecondaryButton } from "~/shared/components/Button";
import { SelectItem } from "~/catalog/components/CreateTeaModal/SelectItem";
import { SearchTextInput } from "~/catalog/components/SearchTextInput";
import { TeaFamilyFilter } from "~/catalog/components/TeaFamilyFilter";
import { makeTypeSearchInfiniteOpt } from "~/catalog/query/teatypeQuery";
import { type IForm, makeCreateTypeMutation } from "~/catalog/mutation/createTypeMutation";
import { CreateTypeModal } from "~/catalog/components/teaType/CreateTypeModal";
import { Family } from "~/components/tea/Family";

// Un-persisted version of a new type
export type NewType = IForm;

export type CreationMode = {
	persist?: boolean;
	onCreated?: (type: NewType | TeaType) => void;
};

export function TypeSelect(
	props: {
		value?: Iri | NewType;
		onChange: (value?: Iri) => void;
		allowToggle?: boolean;
		allowCreate?: boolean;
		className?: string;
	} & CreationMode,
) {
	const [selectedFamily, setSelectedFamily] = useState<TeaFamily>("green");
	const [search, setSearch] = useState<string | undefined>("");
	const [creating, setCreating] = useState<string | boolean>(false);

	const searchQuery = useInfiniteQuery(
		makeTypeSearchInfiniteOpt({ family: selectedFamily, q: search }, { itemsPerPage: 8 }),
	);
	const mutation = useMutation({ ...makeCreateTypeMutation(), onSuccess: (type) => f(props.onCreated)(type) });

	const queryPages = searchQuery.data?.pages ?? [];
	const total = queryPages[0]?.totalItems ?? 0;

	function selectFamily(family?: TeaFamily) {
		if (!family) {
			return;
		}

		setSelectedFamily(family);
	}

	function selectType(type: TeaType) {
		if (props.allowToggle && props.value === type["@id"]) {
			props.onChange(undefined);
			return;
		}

		if (type["@id"] === props.value) {
			return;
		}

		props.onChange(type["@id"]);
	}

	async function handleSubmitNewType(data: NewType) {
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
			<TeaFamilyFilter selected={selectedFamily} onSelect={selectFamily} className="-mx-6 px-6 mt-2 mb-6" />

			{props.value && typeof props.value !== "string" && (
				<div className="my-6 pb-6 border-b border-green-200">
					<h3 className="text-xl font-header mb-2">New type</h3>
					<SelectItem
						label={
							<Fragment>
								{props.value.name} (<Family family={props.value.family} long />)
							</Fragment>
						}
						onClick={() => props.onChange(undefined)}
						selected
						allowToggle
					/>
				</div>
			)}

			<p className="mt-6 mb-2 text-xs text-stone-500 uppercase">
				{searchQuery.isLoading && <span className="inline-block skeleton h-3 w-16" />}
				{!searchQuery.isLoading && <span>{total} types</span>}
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
					page.member.map((type) => (
						<li key={type.id}>
							<SelectItem
								label={type.name}
								selected={type["@id"] === props.value}
								onClick={() => selectType(type)}
								allowToggle={props.allowToggle}
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
						Add a type
					</DashedButton>
				</div>

				<CreateTypeModal
					open={!!creating}
					family={selectedFamily}
					onClose={() => setCreating(false)}
					onConfirm={handleSubmitNewType}
				/>
			</If>
		</div>
	);
}
