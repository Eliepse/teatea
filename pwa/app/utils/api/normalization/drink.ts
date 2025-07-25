import type { Drink } from "~t/types";
import { denormalizeDate } from "~/utils/api/normalization/VODenormalizers";

export type DrinkRaw = Omit<Drink, "drankAt"> & { drankAt: string };

export function denormalizeDrink(drink: DrinkRaw): Drink {
	return { ...drink, drankAt: denormalizeDate(drink.drankAt) };
}
