import { PageLayout } from "~/components/shared/paged/PageLayout";
import { handleUIEvent } from "~/utils/function";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

/**
 * @see https://en.wikipedia.org/wiki/Protected_designation_of_origin
 */

export function IsProtectedOrigin(props: {
	onConfirm: (value: boolean) => void;
	defaultValue?: boolean;
	onBack: () => void;
}) {
	return (
		<PageLayout
			title="Is it a protected appellation?"
			onBack={props.onBack}
			bodyClassName="flex flex-col justify-end"
		>
			<div>
				<button
					className={clsx(
						"btn btn-block h-16 mb-4",
						false === props.defaultValue && "btn-outline btn-primary",
					)}
					onClick={handleUIEvent(() => props.onConfirm(false))}
				>
					<span>No / I don't know</span>
					<XMarkIcon className="size-4 ml-auto" />
				</button>

				<button
					className={clsx(
						"btn btn-block h-16 mb-4",
						true === props.defaultValue && "btn-outline btn-primary",
					)}
					onClick={handleUIEvent(() => props.onConfirm(true))}
				>
					<span>Yes</span>
					<CheckIcon className="size-4 ml-auto" />
				</button>
			</div>
		</PageLayout>
	);
}
