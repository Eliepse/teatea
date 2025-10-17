import type { Cultivar, Member, OriginPath, Tea, TeaFamily, TeaType } from "~t/types";
import { nl2br } from "~/utils/content";
import { f, handleUIEvent } from "~/utils/function";
import { CoffeeCup } from "iconoir-react";
import clsx from "clsx";
import { TeaShortCard } from "~/components/tea/TeaShortCard";

export function SessionRichCard(props: {
	teaId: Tea["id"];
	family: TeaFamily;
	note: string;
	author: Pick<Member, "username">;
	type?: TeaType;
	path?: OriginPath;
	cultivar?: Cultivar;
	year?: number;
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

			<TeaShortCard
				family={props.family}
				cultivar={props.cultivar}
				path={props.path}
				type={props.type}
				year={props.year}
				className="mx-2 bg-white/80"
				noStyle
			/>
		</article>
	);
}
