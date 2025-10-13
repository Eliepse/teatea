import type { PropsWithChildren } from "react";
import type { Iri, User } from "~t/types";
import { useIsAuthor } from "~/auth/components/voters/IfAuthor";

type Author = Partial<Pick<User, "username" | "id" | "@id">>;

export function IfNotAuthor(props: PropsWithChildren<{ author?: Author | Iri }>) {
	const isAuthor = useIsAuthor(props.author);
	return !isAuthor ? props.children : null;
}
