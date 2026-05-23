import { mutationOptions } from "@tanstack/react-query";
import type { Iri, Origin } from "~t/types";
import { extractId } from "~/utils/resource";
import { postApi } from "~/utils/api";

export type IForm = Pick<Origin, "name">;

export function makeCreateOriginMutation() {
	return mutationOptions({
		mutationFn: async (data: IForm & { parent?: Iri }) => {
			const res = await postApi<Origin>("/api/origins", { name: data.name, parentPath: extractId(data.parent) });
			return await res.json();
		},
	});
}
