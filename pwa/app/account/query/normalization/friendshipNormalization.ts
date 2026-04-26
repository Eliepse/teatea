import type { CollectionTea, Friendship } from "~t/types";
import { denormalizeDate } from "~/utils/api/normalization/VODenormalizers";
import { denormalizeTea } from "~/utils/api/normalization/tea";

export type FriendshipRaw = Omit<Friendship, "requestedAt"> & { requestedAt: string };

export function denormalizeFriendship(data: FriendshipRaw): Friendship {
	return {
		...data,
		requestedAt: data.requestedAt ? denormalizeDate(data.requestedAt) : undefined,
	};
}
