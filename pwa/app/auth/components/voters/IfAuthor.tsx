import type { PropsWithChildren } from "react";
import { useUser } from "~/auth/hooks/useUser";
import type { Iri, User } from "~t/types";

type Author = Partial<Pick<User, "username" | "id" | "@id">>;

export function IfAuthor(props: PropsWithChildren<{ author: Author | undefined } | { iri: Iri | undefined }>) {
	if ("author" in props) {
		return useIsAuthor(props.author);
	}

	if ("iri" in props) {
		return useIsAuthor(props.iri);
	}

	return null;
}

export function useIsAuthor(author?: Author | Iri) {
	const user = useUser();
	const userIri = user.data ? `/members/${user.data.username}` : undefined;

	if (typeof author === "string") {
		return author === userIri;
	}

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
