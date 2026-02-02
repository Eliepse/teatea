import { useMutation } from "@tanstack/react-query";
import type { CollectionTea, Iri, NullablePartial } from "~t/types";
import { deleteApi, patchApi } from "~/utils/api";
import { type CollectionTeaRaw, denormalizeCollectionTea } from "~/utils/api/normalization/collectionTea";

export function useCollectionTeaMutations(collectionTeaIri: Iri) {
	const mutation = useMutation({
		mutationFn: async (
			args: NullablePartial<
				Pick<CollectionTea, "acquiredAt" | "finishedAt" | "description" | "rating"> & { acquiredFrom: Iri }
			>,
		) => {
			const response = await patchApi<CollectionTeaRaw>(collectionTeaIri, args);
			return denormalizeCollectionTea(await response.json());
		},
		onError: (e) => alert({ title: "Failed to change this tea", body: e.message }),
	});

	const deleteMutation = useMutation({
		mutationFn: async () => await deleteApi(collectionTeaIri),
		onError: (e) => alert({ title: "Failed to delete this tea", body: e.message }),
	});

	return { patch: mutation, delete: deleteMutation };
}
