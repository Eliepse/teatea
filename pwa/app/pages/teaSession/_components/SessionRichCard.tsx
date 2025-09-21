import type { Member, OriginPath, Tea, TeaFamily, TeaType } from "~t/types";
import { nl2br } from "~/utils/content";
import { f, handleUIEvent } from "~/utils/function";
import { CoffeeCup } from "iconoir-react";
import { Family } from "~/components/tea/Family";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import { Link } from "react-router";
import clsx from "clsx";

export function SessionRichCard(props: {
	teaId: Tea["id"];
	family: TeaFamily;
	type?: TeaType;
	path?: OriginPath;
	author: Pick<Member, "username">;
	note: string;
	onAuthorClick?: () => void;
	className?: string;
}) {
	return (
		<article className={clsx("bg-slate-100 rounded-md text-base-content/80 py-2", props.className)}>
			<div className="mr-auto flex items-center text-base-content/60 px-3 pt-1 mb-2">
				<CoffeeCup className="mr-1 size-4" />
				<span onClick={handleUIEvent(f(props.onAuthorClick))}>{props.author.username}</span>
			</div>

			<p className="text-lg leading-snug px-3 mb-3">{nl2br(props.note)}</p>

			<Link to={`/tea/${props.teaId}`}>
				<div className="flex items-center mx-2 px-3 py-2 rounded-md bg-white/80">
					<div className="mr-auto">
						<Family family={props.family} iconOnly className="mr-2" />
						<span className="capitalize">{props.type?.name ?? `${props.family} tea`}</span>
					</div>

					<div className="text-xs text-base-content/60 leading-tight">
						{props.path && <FormatOriginPath originPath={props.path} />}
					</div>
				</div>
			</Link>
		</article>
	);
}
