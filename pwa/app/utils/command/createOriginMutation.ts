import { mutationOptions } from "@tanstack/react-query";
import type { Iri, Origin } from "~t/types";
import { extractId } from "~/utils/resource";
import { postApi } from "~/utils/api";

export interface IForm extends Pick<Origin, "name"> {
	parent?: Iri;
}

export function makeCreateOriginMutation() {
	return mutationOptions({
		mutationFn: async (data: IForm) => {
			const res = await postApi<Origin>("/api/origins", { name: data.name, parentPath: extractId(data.parent) });
			return await res.json();
		},
	});
}
