import { mutationOptions } from "@tanstack/react-query";
import type { Cultivar } from "~t/types";
import { postApi } from "~/utils/api";

export interface IForm extends Pick<Cultivar, "name"> {}

export function makeCreateCultivarMutation() {
	return mutationOptions({
		mutationFn: async (data: IForm) => {
			const res = await postApi<Cultivar>("/api/cultivars", { name: data.name });
			return await res.json();
		},
	});
}
