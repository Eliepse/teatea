import type { User } from "~t/types";
import { fetchApi } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";
import { UnauthenticatedError } from "~/auth/errors/UnauthenticatedError";
import { useNavigate } from "react-router";

async function fetchSelf(): Promise<User> {
	return await (await fetchApi("/members/me")).json();
}

export function useUser() {
	const navigate = useNavigate();
	const query = useQuery({
		queryFn: fetchSelf,
		queryKey: ["user:me"],
	});

	if(query.error instanceof UnauthenticatedError) {
		navigate("/login");
		return query;
	}

	return query;
}
