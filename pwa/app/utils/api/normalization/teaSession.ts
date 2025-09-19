import type { TeaSession } from "~t/types";
import { denormalizeDate } from "~/utils/api/normalization/VODenormalizers";
import { denormalizeSteep, type SteepRaw } from "~/utils/api/normalization/steep";

export type TeaSessionRaw = Omit<TeaSession, "drankAt" | "steeps"> & { drankAt: string; steeps?: SteepRaw[] };

export function denormalizeTeaSession(session: TeaSessionRaw): TeaSession {
	return {
		...session,
		drankAt: denormalizeDate(session.drankAt),
		steeps: session.steeps?.map(denormalizeSteep),
	};
}
