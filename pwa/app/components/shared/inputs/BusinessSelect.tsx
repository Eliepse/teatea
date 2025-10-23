import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getApi, postApi } from "~/utils/api";
import type { ApiPaginatedCollection, Business, Iri } from "~t/types";
import { DelayedInput } from "~/components/shared/inputs/DelayedInput";
import { useResourceQuery } from "~/utils/api/useResourceQuery";
import clsx from "clsx";
import { Modal } from "~/components/shared/modal/Modal";
import { handleUIEvent } from "~/utils/function";
import { Plus, ShopFourTilesWindow, XmarkCircleSolid } from "iconoir-react";

/*
	@todo: clear field ('allowClear')
 */
export function BusinessSelect(props: {
	placeholder?: string;
	value: Iri | undefined;
	onSelect: (value: Iri | undefined) => void;
	allowCreate?: boolean;
	allowClear?: boolean;
	disabled?: boolean;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [searchText, setSearchText] = useState<string | undefined>();
	const [addBusiness, setAddBusiness] = useState(false);
	const [focused, setFocused] = useState(false);
	const showSearch = focused && true !== props.disabled;
	const showClear = !showSearch && !!props.value && props.allowClear;

	const searchQuery = useQuery({
		queryFn: async ({ queryKey }) => {
			const filters = queryKey[1];

			if (typeof filters === "string") {
				throw new Error("Invalid search");
			}

			// Only fetch the first page
			const response = await getApi<ApiPaginatedCollection<Business>>(`/businesses`, filters);
			return await response.json();
		},
		queryKey: ["search", { q: searchText, itemsPerPage: 50 }],
	});

	const selectedBusiness = useResourceQuery<Business>(props.value);

	function activateSearch() {
		if (true === props.disabled) {
			return;
		}

		inputRef.current?.focus();
		setFocused(true);
	}

	function selectItem(business: Business) {
		if (true === props.disabled) {
			return;
		}

		setFocused(false);
		props.onSelect(business["@id"]);
		void searchQuery.refetch();

		if (document.activeElement) {
			(document.activeElement as HTMLElement).blur();
		}
	}

	return (
		<div className={clsx("dropdown w-full", showSearch && "dropdown-open")}>
			<fieldset className="input w-full pr-0" onClick={activateSearch} disabled={props.disabled}>
				{selectedBusiness.isLoading ? (
					<div className="skeleton h-4 w-24" />
				) : (
					<>
						{!showSearch && selectedBusiness.data?.name && (
							<span className="flex items-center">
								<ShopFourTilesWindow className="size-4 mr-2 inline-block" />{" "}
								{selectedBusiness.data.name}
							</span>
						)}

						{!showSearch && !selectedBusiness.data?.name && (
							<span className="text-base-content/60">{props.placeholder}</span>
						)}
					</>
				)}

				<DelayedInput
					ref={inputRef}
					className={clsx(
						"h-full focus:outline-0 focus:border-none",
						!showSearch ? "w-0 opacity-0 m-0" : "flex-1",
					)}
					value={searchText}
					onChange={setSearchText}
					onBlur={() => setFocused(false)}
				/>

				{showSearch && searchQuery.isLoading && <span className="loading loading-spinner loading-xs mr-2" />}
				{showClear && (
					<button
						className="flex-none h-full px-4 cursor-pointer"
						onClick={handleUIEvent(() => props.onSelect(undefined))}
					>
						<XmarkCircleSolid className="size-4" />
					</button>
				)}
			</fieldset>

			<ul className="dropdown-content menu bg-base-100 rounded-box z-1 w-64 p-2 shadow-sm">
				{searchQuery.isLoading && (
					<>
						<li>
							<div className="skeleton h-8 mb-2" />
						</li>
						<li>
							<div className="skeleton h-8 mb-2" />
						</li>
						<li>
							<div className="skeleton h-8 mb-2" />
						</li>
					</>
				)}

				{searchQuery.data?.member?.map((business) => (
					<li key={business.id}>
						<button
							className={clsx("flex items-center", props.value === business["@id"] && "menu-active")}
							onClick={handleUIEvent(() => selectItem(business))}
						>
							<ShopFourTilesWindow className="size-4 mr-2 inline-block" /> {business.name}
						</button>
					</li>
				))}

				{0 === searchQuery.data?.member?.length && (
					<li className="menu-disabled">
						<button className="flex items-center" disabled>
							No results found
						</button>
					</li>
				)}

				{true === props.allowCreate && !searchQuery.isLoading && (
					<li className="border-t border-base-300 pt-2 mt-2">
						<button onClick={handleUIEvent(() => setAddBusiness(true))}>
							Add a business
							<Plus className="size-3 ml-auto" />
						</button>
					</li>
				)}
			</ul>

			<AddBusinessModal
				onClose={() => setAddBusiness(false)}
				open={addBusiness}
				onCreated={(b) => selectItem(b)}
			/>
		</div>
	);
}

function AddBusinessModal(props: { onClose: () => void; open: boolean; onCreated: (business: Business) => void }) {
	const [value, setValue] = useState("");

	const createMutation = useMutation({
		mutationFn: async (data: Pick<Business, "name">) => {
			return await (await postApi<Business>("/businesses", { ...data, name: data.name.trim() })).json();
		},
		onSuccess: (data) => {
			props.onCreated(data);
			props.onClose();
		},
	});

	return (
		<Modal onClose={props.onClose} open={props.open} position="bottom">
			<div className="flex mb-4">
				<button className="btn mr-auto" onClick={props.onClose}>
					Cancel
				</button>
				<button
					className="btn btn-primary"
					disabled={createMutation.isPending || !value.trim()}
					onClick={handleUIEvent(() => createMutation.mutate({ name: value }))}
				>
					Add
				</button>
			</div>

			<fieldset className="fieldset">
				<label>Name</label>
				<input
					className="input input-lg w-auto"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					disabled={createMutation.isPending}
				/>
			</fieldset>
		</Modal>
	);
}
