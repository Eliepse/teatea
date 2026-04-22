import { parseISO } from "date-fns";

export function denormalizeDate(formattedDate: string): Date {
	return parseISO(formattedDate);
}
