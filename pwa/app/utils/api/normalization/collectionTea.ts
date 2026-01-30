import type { CollectionTea } from "~t/types";
import { denormalizeDate } from "~/utils/api/normalization/VODenormalizers";
import { denormalizeTea, type TeaRaw } from "~/utils/api/normalization/tea";

export type CollectionTeaRaw = Omit<CollectionTea, "acquiredAt" | "finishedAt" | "tea"> & {
	acquiredAt: string;
	finishedAt: string;
	tea: TeaRaw;
};

export function denormalizeCollectionTea(data: CollectionTeaRaw): CollectionTea {
	return {
		...data,
		acquiredAt: data.acquiredAt ? denormalizeDate(data.acquiredAt) : undefined,
		finishedAt: data.finishedAt ? denormalizeDate(data.finishedAt) : undefined,
		tea: denormalizeTea(data.tea),
	};
}
