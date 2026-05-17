import { Fragment, useState } from "react";
import { Shop } from "iconoir-react";
import { TeaSpecButton } from "~/catalog/components/CreateTeaModal/TeaSpecButton";
import { type Iri } from "~t/types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { makeBusinessInfiniteOpt, makeBusinessQueryOpt } from "~/utils/query/businessQuery";
import { Modal } from "~/components/shared/modal/Modal";
import { PrimaryButton, SecondaryButton } from "~/shared/components/Button";
import { SearchTextInput } from "~/catalog/components/SearchTextInput";
import { SelectItem } from "~/catalog/components/CreateTeaModal/SelectItem";

export function BusinessAction(props: { business?: Iri; onChange: (business?: Iri) => void }) {
	const [isSelecting, setIsSelecting] = useState(false);
	const [selectedBusiness, setSelectedBusiness] = useState<Iri | undefined>();
	const [search, setSearch] = useState<string | undefined>();

	const queryBusiness = useQuery(makeBusinessQueryOpt({ "@id": props.business }));
	const searchQuery = useInfiniteQuery({
		...makeBusinessInfiniteOpt({ q: search }, { itemsPerPage: 16 }),
		enabled: isSelecting,
	});

	const queryPages = searchQuery.data?.pages ?? [];
	const total = queryPages[0]?.totalItems ?? 0;
	const label = queryBusiness.data?.name ?? "Business";

	function selectBusiness(iri: Iri) {
		setSelectedBusiness((v) => (v !== iri ? iri : undefined));
	}

	function cancel() {
		setSelectedBusiness(props.business);
		setIsSelecting(false);
	}

	function confirm() {
		props.onChange(selectedBusiness);
		setIsSelecting(false);
	}

	return (
		<Fragment>
			<TeaSpecButton
				icon={<Shop className="size-4" />}
				label={queryBusiness.isLoading ? <span className="inline-block skeleton h-4 w-16" /> : label}
				onClick={() => setIsSelecting(true)}
				filled={!!props.business}
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
						page.member.map((business) => (
							<li key={business.id}>
								<SelectItem
									label={business.name}
									selected={business["@id"] === selectedBusiness}
									onClick={() => selectBusiness(business["@id"])}
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
