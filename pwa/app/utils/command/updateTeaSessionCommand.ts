import { mutationOptions } from "@tanstack/react-query";
import type { Iri, TeaSession } from "~t/types";
import { patchApi } from "~/utils/api";
import { denormalizeTeaSession, type TeaSessionRaw } from "~/utils/api/normalization/teaSession";

type Patchable = "brewingType" | "note" | "quality" | "teaQuantity" | "waterMl";
type Patch = Partial<Pick<TeaSession, Patchable>>;

async function updateSessionCommand(iri: Iri, patch: Patch) {
	const res = await patchApi<TeaSessionRaw>(iri, { ...patch } satisfies Partial<Pick<TeaSessionRaw, Patchable>>);
	return denormalizeTeaSession(await res.json());
}

export function makePathTeaSessionMutationOpt(iri: Iri) {
	return mutationOptions({
		mutationFn: async (patch: Patch) => await updateSessionCommand(iri, patch),
	});
}
