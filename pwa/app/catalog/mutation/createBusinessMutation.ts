import { mutationOptions } from "@tanstack/react-query";
import type { Business } from "~t/types";
import { postApi } from "~/utils/api";

export interface IForm extends Pick<Business, "name"> {}

export function makeCreateBusinessMutation() {
	return mutationOptions({
		mutationFn: async (data: IForm) => {
			const res = await postApi<Business>("/api/businesses", { name: data.name });
			return await res.json();
		},
	});
}
