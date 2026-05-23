import { Fragment, useState } from "react";
import { Leaf } from "iconoir-react";
import clsx from "clsx";
import { TeaSpecButton } from "~/catalog/components/CreateTeaModal/TeaSpecButton";
import { Modal } from "~/components/shared/modal/Modal";
import { TeaFamilyFilter } from "~/catalog/components/TeaFamilyFilter";
import { type Iri, teaFamilies, type TeaFamily } from "~t/types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { makeTypeSearchInfiniteOpt } from "~/utils/query/teaTypeQuery";
import { SearchTextInput } from "~/catalog/components/SearchTextInput";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";
import { makeTeaTypeQueryOpt } from "~/catalog/query/teatypeQuery";
import { SelectItem } from "~/catalog/components/CreateTeaModal/SelectItem";

export function FamilyTypeAction(props: {
	family: TeaFamily;
	type?: Iri;
	onChange: (family: TeaFamily, type?: Iri) => void;
}) {
	const [isSelecting, setIsSelecting] = useState(false);
	const [selectedFamily, setSelectedFamily] = useState<TeaFamily>(props.family);
	const [selectedType, setSelectedType] = useState<Iri | undefined>(props.type);
	const [search, setSearch] = useState<string | undefined>();

	const typeQuery = useQuery(makeTeaTypeQueryOpt({ "@id": props.type }));
	const searchQuery = useInfiniteQuery({
		...makeTypeSearchInfiniteOpt({ family: selectedFamily, q: search }, { itemsPerPage: 8 }),
		enabled: isSelecting,
	});

	const queryPages = searchQuery.data?.pages ?? [];
	const total = queryPages[0]?.totalItems ?? 0;
	const familyLabel = teaFamilies[props.family];
	const label = typeQuery?.data ? `${typeQuery.data.name} (${familyLabel})` : "Tea type";

	function selectFamily(family?: TeaFamily) {
		if (!family) {
			return;
		}

		setSelectedFamily(family);
	}

	function cancel() {
		setSelectedFamily(props.family);
		setSelectedType(props.type);
		setSearch(undefined);
		setIsSelecting(false);
	}

	function confirm() {
		props.onChange(selectedFamily, selectedType);
		setIsSelecting(false);
	}

	return (
		<Fragment>
			<TeaSpecButton
				icon={<Leaf className={clsx("size-4")} />}
				label={typeQuery.isLoading ? <span className="inline-block skeleton h-4 w-16" /> : label}
				onClick={() => setIsSelecting(true)}
				filled={!!selectedType}
			/>

			<Modal open={isSelecting} onClose={() => setIsSelecting(false)} className="pb-6 flex flex-col h-full">
				<div className="flex-none">
					<div className="flex gap-4 p-4 mb-4 border-b border-green-200">
						<SecondaryButton className="flex-1" onClick={cancel}>
							Cancel
						</SecondaryButton>
						<PrimaryButton className="flex-2" onClick={confirm} disabled={!selectedType}>
							Confirm
						</PrimaryButton>
					</div>

					<div className="px-4 mb-2">
						<SearchTextInput onChange={setSearch} defaultValue={search} />
					</div>

					<TeaFamilyFilter selected={selectedFamily} onSelect={selectFamily} className="px-4 mb-6" />

					<p className="mx-4 mb-2 text-xs text-stone-500 uppercase">
						{searchQuery.isLoading && <span className="inline-block skeleton h-3 w-16" />}
						{!searchQuery.isLoading && (
							<span>
								{total} type{(1 < total || 0 === total) && "s"}
							</span>
						)}
					</p>
				</div>

				<ul className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
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
						</Fragment>
					)}

					{queryPages.map((page) =>
						page.member.map((type) => (
							<li key={type.id}>
								<SelectItem
									label={type.name}
									selected={type["@id"] === selectedType}
									onClick={() =>
										setSelectedType((iri) => (iri === type["@id"] ? undefined : type["@id"]))
									}
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
			</Modal>
		</Fragment>
	);
}
