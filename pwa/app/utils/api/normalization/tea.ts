import type { Drink, Tea } from "~t/types";
import { denormalizeDate } from "~/utils/api/normalization/VODenormalizers";

export type TeaRaw = Omit<Tea, "addedAt"> & { addedAt: string };

export function denormalizeTea(tea: TeaRaw): Tea {
	return { ...tea, addedAt: denormalizeDate(tea.addedAt) };
}
