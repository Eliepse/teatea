import { type Iri, type TeaSession } from "~t/types";
import { extractId } from "~/utils/resource";
import clsx from "clsx";
import { useNavigate } from "react-router";

export function TeaSession(props: { id: number; author: Iri; className?: string; tea: TeaSession["tea"] }) {
	const navigate = useNavigate();

	return (
		<article className={clsx("text-sm text-stone-800", props.className)} onClick={() => navigate(`/sessions/${props.id}`)}>
			@{extractId(props.author)} drank a <strong>{props.tea.type?.name}</strong>
		</article>
	);
}
