import type { Iri, RoastLevel } from "~t/types";
import type { NewOrigin } from "~/components/origin/OriginSelect";

export type NewTeaData = {
	type?: Iri;
	origin?: Iri | NewOrigin;
	business?: Iri;
	cultivar?: Iri;
	year?: number;
	roast?: RoastLevel;
};
