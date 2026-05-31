import { Fragment, useState } from "react";
import { SoilAlt } from "iconoir-react";
import { TeaSpecButton } from "~/catalog/components/CreateTeaModal/TeaSpecButton";
import { type Iri } from "~t/types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Modal } from "~/components/shared/modal/Modal";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";
import { SearchTextInput } from "~/catalog/components/SearchTextInput";
import { SelectItem } from "~/catalog/components/CreateTeaModal/SelectItem";
import { makeCultivarQueryOpt, makeCultivarSearchInfiniteOpt } from "~/shared/query/cultivarQuery";

export function OldCultivarAction(props: { cultivar?: Iri; onChange: (cultivar?: Iri) => void }) {
	const [isSelecting, setIsSelecting] = useState(false);
	const [selectedCultivar, setSelectedCultivar] = useState<Iri | undefined>();
	const [search, setSearch] = useState<string | undefined>();

	const queryResource = useQuery(makeCultivarQueryOpt({ "@id": props.cultivar }));
	const searchQuery = useInfiniteQuery({
		...makeCultivarSearchInfiniteOpt({ q: search }, { itemsPerPage: 16 }),
		enabled: isSelecting,
	});

	const queryPages = searchQuery.data?.pages ?? [];
	const total = queryPages[0]?.totalItems ?? 0;
	const label = queryResource.data?.name ?? "Cultivar";

	function selectBusiness(iri: Iri) {
		setSelectedCultivar((v) => (v !== iri ? iri : undefined));
	}

	function cancel() {
		setSelectedCultivar(props.cultivar);
		setIsSelecting(false);
	}

	function confirm() {
		props.onChange(selectedCultivar);
		setIsSelecting(false);
	}

	return (
		<Fragment>
			<TeaSpecButton
				icon={<SoilAlt className="size-4" />}
				label={queryResource.isLoading ? <span className="inline-block skeleton h-4 w-16" /> : label}
				onClick={() => setIsSelecting(true)}
				filled={!!props.cultivar}
			/>

			<Modal open={isSelecting} onClose={() => setIsSelecting(false)} className="pb-6 flex flex-col h-full">
				<div className="flex-none">
					<div className="flex gap-4 p-4 mb-4 border-b border-green-200">
						<SecondaryButton className="flex-1" onClick={cancel}>
							Cancel
						</SecondaryButton>
						<PrimaryButton className="flex-2" onClick={confirm}>
							Confirm
						</PrimaryButton>
					</div>

					<div className="px-4 mb-6">
						<SearchTextInput onChange={setSearch} defaultValue={search} />
					</div>

					<p className="mx-4 mb-2 text-xs text-stone-500 uppercase">
						{searchQuery.isLoading && <span className="inline-block skeleton h-3 w-16" />}
						{!searchQuery.isLoading && <span>{total} business</span>}
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
							<li className="skeleton h-14 rounded-xl" />
						</Fragment>
					)}

					{queryPages.map((page) =>
						page.member.map((cultivar) => (
							<li key={cultivar.id}>
								<SelectItem
									label={cultivar.name}
									selected={cultivar["@id"] === selectedCultivar}
									onClick={() => selectBusiness(cultivar["@id"])}
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
