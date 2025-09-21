import type { Member, OriginPath, TeaFamily, TeaType } from "~t/types";
import { f, handleUIEvent } from "~/utils/function";
import { Family } from "~/components/tea/Family";
import { FormatOriginPath } from "~/components/shared/FormatOriginPath";
import { CoffeeCup } from "iconoir-react";

export function SessionShortCard(props: {
	family: TeaFamily;
	type?: TeaType;
	path?: OriginPath;
	author: Pick<Member, "username">;
	onAuthorClick?: () => void;
}) {
	return (
		<article className="bg-slate-100 rounded-md px-3 py-2 flex items-center text-base-content/80">
			<div className="mr-auto inline-flex items-center">
				<CoffeeCup className="mr-2 size-4 text-base-content/60" />
				<span onClick={handleUIEvent(f(props.onAuthorClick))}>{props.author.username}</span>
			</div>
			<div className="text-sm text-right">
				<div>
					<Family family={props.family} iconOnly className="mr-1" />
					<span className="capitalize">{props.type?.name ?? `${props.family} tea`}</span>
				</div>

				<div className="text-xs text-base-content/60 leading-tight">
					{props.path && <FormatOriginPath originPath={props.path} />}
				</div>
			</div>
		</article>
	);
}
