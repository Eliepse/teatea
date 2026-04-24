import { useQuery } from "@tanstack/react-query";
import { makeSelfQueryOpt } from "~/auth/query/selfQuery";

export function useUser() {
	return useQuery(makeSelfQueryOpt());
}
