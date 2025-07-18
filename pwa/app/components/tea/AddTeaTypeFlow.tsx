import { StackFrame, useNavigationStack } from "~/utils/navigation/useNavigationStack";
import Arrow from "~/components/icons/arrow";
import { handleUIEvent } from "~/utils/function";

export function AddTeaTypeFlow(props: { defaultOriginId?: number }) {
	const { NavigationStack } = useNavigationStack({ defaultFrame: { key: "naming" } });

	return (
		<NavigationStack>
			<StackFrame frameKey="naming">
				<div className="flex flex-col h-screen">
					<div className="flex-none">
						<button
							className="btn btn-ghost pl-4 mt-2"
							onClick={handleUIEvent(() => console.debug("back"))}
							// disabled={false === props.onBack}
						>
							<Arrow direction="left" className="size-4" />
						</button>

						<h2 className="px-4 pb-4 mt-2 text-lg text-base-content">What is the name of this tea?</h2>
					</div>

					<div className="p-4 flex-1 overflow-y-auto">
						<label className="input w-full">
							<input type="search" className="grow" placeholder="Name of the type" />
							<span className="badge badge-neutral badge-xs">English</span>
						</label>
					</div>

					<div className="fixed bottom-4 inset-x-4" />
				</div>
			</StackFrame>
		</NavigationStack>
	);
}
