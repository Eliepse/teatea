import { CheckCircle, WarningTriangle } from "iconoir-react";
import clsx from "clsx";
import { Fragment } from "react";
import { Spinner } from "~/shared/components/Spinner";

export function SimilarTeasWarning(props: { count?: number; loading?: boolean }) {
	const hasSimilar = !!props.count;

	return (
		<div
			className={clsx(
				"flex-none flex items-center text-center rounded-lg mx-4 px-3 py-2 text-sm",
				(props.loading || hasSimilar) && "bg-lime-100 text-lime-700",
				!props.loading && !hasSimilar && "bg-green-100 text-green-700",
			)}
		>
			{props.loading && <WhileLoading />}
			{!props.loading && hasSimilar && <SimilarExists count={props.count ?? 0} />}
			{!props.loading && !hasSimilar && <NothingFound />}
		</div>
	);
}

function SimilarExists(props: { count: number }) {
	return (
		<Fragment>
			<p>
				<WarningTriangle className="inline size-4 mr-2" />
				A similar tea already exists
			</p>
			{/*<button className="ml-auto text-lime-900">*/}
			{/*	Open <ArrowRight className="ml-1 size-3 inline" />*/}
			{/*</button>*/}
		</Fragment>
	);
}

function WhileLoading() {
	return (
		<Fragment>
			<p>Looking if a similar tea already exists</p>

			<Spinner className="inline size-4 ml-auto" />
		</Fragment>
	);
}

function NothingFound() {
	return (
		<p>
			<CheckCircle className="inline size-4 mr-1" /> All good, no similar tea found!
		</p>
	);
}
