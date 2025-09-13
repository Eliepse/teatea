import type { TeaSession } from "~t/types";
import { denormalizeDate } from "~/utils/api/normalization/VODenormalizers";

export type TeaSeassionRaw = Omit<TeaSession, "drankAt"> & { drankAt: string };

export function denormalizeTeaSession(session: TeaSeassionRaw): TeaSession {
	return { ...session, drankAt: denormalizeDate(session.drankAt) };
}
