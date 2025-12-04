import { type ReactNode, useState } from "react";
import clsx from "clsx";
import type { ApiPaginatedCollection, Cultivar, Iri } from "~t/types";
import { useQuery } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import { Search } from "iconoir-react";
import { handleUIEvent } from "~/utils/function";
import { DelayedInput } from "~/components/shared/inputs/DelayedInput";
import Arrow from "~/components/icons/arrow";

export function SelectCultivar(props: {
	onConfirm: (value?: Iri) => void | Promise<void>;
	defaultValue?: Iri;
	onBack?: () => void;
	header?: ReactNode;
	className?: string;
	confirmLabel?: string;
	confirmIcon?: ReactNode;
}) {
	const [value, setValue] = useState(props.defaultValue);
	const [search, setSearch] = useState("");
	const cultivarsQuery = useQuery({
		queryFn: async ({ queryKey }) => {
			const params = queryKey[1];

			if (typeof params === "string") {
				throw new Error("Invalid search");
			}

			return await (await getApi<ApiPaginatedCollection<Cultivar>>(`/cultivars`, params)).json();
		},
		queryKey: ["search", { q: search, itemsPerPage: 25 }],
	});

	function selectBusiness(cultivar: Cultivar) {
		setValue((iri) => (iri === cultivar["@id"] ? undefined : cultivar["@id"]));
	}

	async function confirm() {
		return props.onConfirm(value);
	}

	return (
		<div className={clsx("flex flex-col", props.className)}>
			{props.header}

			<div className="p-4 bg-white sticky top-0">
				<label className="input input-lg w-full rounded-xl">
					<Search className="h-4 text-teal-600" />
					<DelayedInput
						type="search"
						className="grow"
						placeholder="Search for a cultivar"
						value={search}
						onChange={setSearch}
					/>
				</label>
			</div>

			<div className="px-4 flex-1 overflow-y-auto">
				<ul>
					{cultivarsQuery.isPending && (
						<>
							<li className="mb-2 skeleton h-14 rounded-xl" />
							<li className="mb-2 skeleton h-14 rounded-xl" />
							<li className="mb-2 skeleton h-14 rounded-xl" />
						</>
					)}

					{cultivarsQuery.data?.member.map((cultivar) => (
						<li key={cultivar.id} className="mb-2">
							<button
								className={clsx(
									"btn btn-lg h-14 btn-block rounded-xl",
									value === cultivar["@id"]
										? "bg-green-700 text-white"
										: "bg-green-100 text-green-900",
								)}
								onClick={handleUIEvent(() => selectBusiness(cultivar))}
							>
								{cultivar.name}
							</button>
						</li>
					))}
				</ul>
			</div>

			<div className="flex p-4 flex-none bg-white sticky bottom-0">
				{props.onBack && (
					<button className="btn btn-lg bg-green-100 rounded-xl" onClick={handleUIEvent(props.onBack)}>
						<Arrow direction="left" className="size-4 mr-1" />
						Back
					</button>
				)}

				<button
					className="ml-auto btn btn-lg bg-green-700 text-white rounded-xl disabled:bg-teal-100 disabled:text-teal-500"
					onClick={handleUIEvent(confirm)}
				>
					{props.confirmLabel ?? "Next"}
					{props.confirmIcon ?? <Arrow direction="right" className="size-4 ml-1" />}
				</button>
			</div>
		</div>
	);
}
