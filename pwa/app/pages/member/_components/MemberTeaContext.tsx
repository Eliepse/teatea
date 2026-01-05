import { createContext, useContext } from "react";
import type { CollectionTea } from "~t/types";

type Action = "edit:acquiredFrom" | "edit:acquiredAt" | "edit:description";

export type MemberTeaContext = {
	item: CollectionTea;
	act: (action: Action) => void;
};

export const MemberTeaCTX = createContext<MemberTeaContext | undefined>(undefined);

export function useCollectionTeaContext() {
	return useContext(MemberTeaCTX);
}
