import type { PropsWithChildren } from "react";
import { useUser } from "~/auth/hooks/useUser";
import type { User } from "~t/types";

type Author = Partial<Pick<User, "username" | "id" | "@id">>;

export function IfAuthor(props: PropsWithChildren<{ author?: Author }>) {
	return useIsAuthor(props.author);
}

export function useIsAuthor(author?: Author) {
	const user = useUser();
	const userIri = user.data ? `/members/${user.data.username}` : undefined;

	if (undefined !== author?.["@id"] && author["@id"] === userIri) {
		return true;
	}

	if (undefined !== author?.id && author.id === user.data?.id) {
		return true;
	}

	if (undefined !== author?.username && author.username === user.data?.username) {
		return true;
	}

	return false;
}
