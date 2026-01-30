import { createContext, useContext } from "react";
import type { CollectionTea } from "~t/types";

type Action = "edit:acquiredFrom" | "edit:acquiredAt" | "edit:description" | "edit:finishedAt";

export type MemberTeaContext = {
	item: CollectionTea;
	act: (action: Action) => void;
};

export const MemberTeaCTX = createContext<MemberTeaContext | undefined>(undefined);

export function useCollectionTeaContext() {
	return useContext(MemberTeaCTX);
}
