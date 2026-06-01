import { mutationOptions } from "@tanstack/react-query";
import type { TeaType } from "~t/types";
import { postApi } from "~/utils/api";

export interface IForm extends Pick<TeaType, "name" | "family"> {}

export function makeCreateTypeMutation() {
	return mutationOptions({
		mutationFn: async (data: IForm) => {
			const res = await postApi<TeaType>("/api/tea_types", {
				name: data.name,
				family: data.family,
			} satisfies IForm);
			return await res.json();
		},
	});
}
