import { PageLayout } from "~/components/shared/paged/PageLayout";
import { type Origin } from "~t/types";
import { useTeaFormContext } from "./AddTeaForm";
import { Check } from "~/components/icons/Check";
import { useMemo } from "react";
import clsx from "clsx";
import Chevron from "~/components/icons/chevron";
import { useOriginByPath } from "~/utils/api/useOrigins";
import { useStackNavigator } from "~/utils/navigation/useNavigationStack";

export function SelectOrigin() {
	const { data, isLoading } = useOriginByPath();
	const context = useTeaFormContext();
	const navigationStack = useStackNavigator();
	const { origin: selectedOrigin } = context.formValue;
	const leavesPaths = useMemo(() => {
		const paths = Object.keys(data ?? {});
		return paths.filter((key) => {
			// Doesn't have children if only itself is found
			return 1 === paths.filter((path) => path.startsWith(key)).length;
		});
	}, [data]);
	const isLeaf = selectedOrigin ? leavesPaths.includes(selectedOrigin.path.nodes.join(".")) : true;
	const originList = useMemo(() => {
		if (!data) {
			return [];
		}

		const selectedPathLength = selectedOrigin?.path?.nodes?.length ?? 1;
		const targetedLevel = isLeaf ? selectedPathLength : selectedPathLength + 1;
		const path = selectedOrigin ? selectedOrigin.path.nodes.slice(0, isLeaf ? -1 : undefined).join(".") : null;

		return Object.entries(data)
			.filter(([key, origin]) => {
				// Limit to n+1 level
				if (targetedLevel !== origin.path.nodes.length) {
					return false;
				}

				return null === path || key.startsWith(path);
			})
			.map(([_, o]) => o);
	}, [data, isLeaf, selectedOrigin?.path]);

	function back() {
		if (!selectedOrigin || !data) {
			return;
		}

		const parentPath = selectedOrigin.path.nodes.slice(0, -1).join(".");
		const parent = data[parentPath];

		if (0 === parentPath.length) {
			context.patchForm({ origin: undefined });
			return;
		}

		if (!parent) {
			context.patchForm({ origin: undefined });
			console.warn(`Failed to find the parent origin of ${parentPath}`);
			return;
		}

		context.patchForm({ origin: parent });
	}

	function changeOrigin(origin: Origin): void {
		context.patchForm({ origin });
	}

	function confirm() {
		navigationStack.next({ key: "other" });
	}

	return (
		<PageLayout
			title="Where does it come from?"
			onBack={navigationStack.back}
			action={
				<div className="flex justify-center">
					{selectedOrigin && (
						<button className="btn rounded-full mr-auto" onClick={back}>
							Back
						</button>
					)}

					{selectedOrigin && (
						<button className="ml-2 btn btn-primary rounded-full" onClick={confirm}>
							{selectedOrigin.name}
							<Check className="size-4 ml-1" />
						</button>
					)}
				</div>
			}
		>
			{isLoading && "Loading..."}

			{originList.map((origin) => (
				<button
					key={origin.id}
					onClick={() => changeOrigin(origin)}
					className={clsx("mb-2 btn btn-block h-12", selectedOrigin?.id === origin.id && "btn-primary")}
				>
					{origin.name}
					<Chevron
						direction="right"
						className={clsx(
							"size-4 ml-auto",
							leavesPaths.includes(origin.path.nodes.join(".")) && "invisible",
						)}
					/>
				</button>
			))}
		</PageLayout>
	);
}
