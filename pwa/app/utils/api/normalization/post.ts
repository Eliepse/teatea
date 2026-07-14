import type { Post } from "~t/types";
import { denormalizeDate } from "~/utils/api/normalization/VODenormalizers";

export type PostRaw = Omit<Post, "createdAt" | "updatedAt"> & { createdAt: string; updatedAt: string };

export function denormalizePost(post: PostRaw): Post {
	return {
		...post,
		createdAt: denormalizeDate(post.createdAt),
		updatedAt: denormalizeDate(post.updatedAt),
	};
}
