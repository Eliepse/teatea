import type { ApiPaginatedCollection, Business, Iri } from "~t/types";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getApi, postApi } from "~/utils/api";
import clsx from "clsx";
import { Plus, RefreshDouble, Search } from "iconoir-react";
import { handleUIEvent } from "~/utils/function";
import { NextButton } from "~/components/shared/form/modal-multistep/NextButton";

export function BusinessPickerStep(props: {
	onConfirm: (value?: Iri) => void;
	defaultValue?: Iri;
	allowEmpty?: boolean;
}) {
	const [value, setValue] = useState(props.defaultValue);
	const [search, setSearch] = useState("");
	const businessQuery = useQuery({
		queryFn: async ({ queryKey }) => {
			const parms = queryKey[1];

			if (typeof parms === "string") {
				throw new Error("Invalid search");
			}

			return await (await getApi<ApiPaginatedCollection<Business>>(`/businesses`, parms)).json();
		},
		queryKey: ["search", { q: search, itemsPerPage: 50 }],
	});

	function selectBusiness(business: Business) {
		if (!props.allowEmpty) {
			setValue(business["@id"]);
			return;
		}

		setValue((iri) => (iri === business["@id"] ? undefined : business["@id"]));
	}

	async function confirm() {
		return props.onConfirm(value);
	}

	return (
		<>
			<div className="flex flex-col">
				<div className="p-4 bg-white">
					<label className="input input-lg w-full rounded-xl">
						<Search className="h-4 text-teal-600" />
						<input
							type="search"
							className="grow"
							placeholder="Search for a place"
							value={search}
							onChange={(e) => setSearch(e.currentTarget.value)}
						/>
					</label>
				</div>

				<div className="px-4 flex-1 overflow-y-auto">
					<ul>
						{businessQuery.isPending && (
							<>
								<li className="mb-2 skeleton h-14 rounded-xl" />
								<li className="mb-2 skeleton h-14 rounded-xl" />
								<li className="mb-2 skeleton h-14 rounded-xl" />
							</>
						)}

						{businessQuery.data?.member.map((business) => (
							<li key={business.id} className="mb-2">
								<button
									className={clsx(
										"btn btn-lg h-14 btn-block rounded-xl",
										value === business["@id"]
											? "bg-green-700 text-white"
											: "bg-green-100 text-green-900",
									)}
									onClick={handleUIEvent(() => selectBusiness(business))}
								>
									{business.name}
								</button>
							</li>
						))}

						<li className="mb-4">
							<AddButton
								onCreated={(business) => {
									setSearch(business.name);
									setValue(business["@id"]);
								}}
							/>
						</li>
					</ul>
				</div>
			</div>

			<div className="p-4 sticky bottom-0 bg-white">
				<NextButton
					onClick={confirm}
					disabled={!props.allowEmpty && !value}
					label={props.allowEmpty && !value ? "I don't know" : "Next"}
				/>
			</div>
		</>
	);
}

function AddButton(props: { onCreated: (business: Business) => void }) {
	const [mode, setMode] = useState<"read" | "write">("read");
	const [name, setName] = useState("");

	const mutation = useMutation({
		mutationFn: async (name: string) => await (await postApi<Business>("/businesses", { name })).json(),
		onSuccess: (business) => {
			setName("");
			setMode("read");
			props.onCreated(business);
		},
	});

	if ("read" === mode) {
		return (
			<button
				className={clsx(
					"btn btn-lg btn-dash h-14 btn-block rounded-xl justify-between",
					"border-green-700 text-green-700",
				)}
				onClick={handleUIEvent(() => setMode("write"))}
			>
				Add a business <Plus />
			</button>
		);
	}

	return (
		<div className="flex rounded-xl border border-green-700 h-14 items-stretch overflow-hidden focus-within:border-green-900">
			<input
				className="flex-1 px-4 text-lg outline-0"
				value={name}
				onChange={(e) => setName(e.currentTarget.value)}
				disabled={mutation.isPending}
			/>
			<button
				className="flex-none btn btn-lg h-full not-disabled:bg-green-700 not-disabled:text-white border-none rounded-none"
				disabled={2 > name.trim().length || mutation.isPending}
				onClick={() => mutation.mutate(name)}
			>
				{mutation.isPending && <RefreshDouble className="animate-spin" />}
				{!mutation.isPending && "Submit"}
			</button>
		</div>
	);
}
