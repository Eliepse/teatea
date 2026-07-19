import type { FeedItem, Post } from "~t/types";
import { denormalizeDate } from "~/utils/api/normalization/VODenormalizers";
import { denormalizePost, type PostRaw } from "~/utils/api/normalization/post";
import { denormalizeTeaSession, type TeaSessionRaw } from "~/utils/api/normalization/teaSession";

export type FeedItemRaw = Omit<FeedItem, "publishedAt" | "item"> & {
	item: PostRaw | TeaSessionRaw;
	publishedAt: string;
};

export function denormalizeFeedItem(feedItem: FeedItemRaw): FeedItem {
	return {
		...feedItem,
		item: denormalizeItem(feedItem.item),
		publishedAt: denormalizeDate(feedItem.publishedAt),
	};
}

function denormalizeItem(item: FeedItemRaw["item"]): FeedItem["item"] {
	if ("Post" === item["@type"]) {
		return denormalizePost(item);
	}

	if ("TeaSession" === item["@type"]) {
		return denormalizeTeaSession(item);
	}

	throw new Error(`FeedItem of type "${item["@type"]}" not supported`);
}
