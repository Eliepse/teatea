import { mutationOptions } from "@tanstack/react-query";
import type { Post } from "~t/types";
import { denormalizePost, type PostRaw } from "~/utils/api/normalization/post";
import { postApi } from "~/utils/api";

export interface IForm extends Pick<Post, "content"> {
}

export function makeCreatePostMutation() {
	return mutationOptions({
		mutationFn: async (data: IForm) => {
			const res = await postApi<PostRaw>("/api/posts", { content: data.content });
			return denormalizePost(await res.json());
		}
	});
}
