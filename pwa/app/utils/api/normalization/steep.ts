import type { Steep } from "~t/types";
import { Duration, Temperature } from "~/utils/value-objects/units";

export type SteepRaw = Omit<Steep, "duration" | "temperature"> & { duration: number; temperature: number | null };

export function denormalizeSteep(steep: SteepRaw): Steep {
	return {
		...steep,
		duration: new Duration(steep.duration),
		temperature: steep.temperature ? new Temperature(steep.temperature) : undefined,
	};
}
