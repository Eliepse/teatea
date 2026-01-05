import type { PropsWithChildren } from "react";
import { ArrowLeft } from "iconoir-react";
import clsx from "clsx";

export function SteppedModalFormLayout(
	props: PropsWithChildren<{ title: string; progress?: number; onBack?: () => void; className?: string }>,
) {
	return (
		<>
			<div className={clsx("text-green-900 z-10 sticky top-0 bg-white", props.className)}>
				{!!props.onBack && <BackButton onBack={props.onBack} />}

				{!!props.title && (
					<h1 className="py-4 mx-14 font-header font-medium text-center text-xl">{props.title}</h1>
				)}

				{!!props.title && <div className="h-0 border-b border-green-100" />}

				<ProgressBar value={props.progress ?? 0} />
			</div>

			{props.children}
		</>
	);
}

function BackButton(props: { onBack: () => void }) {
	return (
		<button
			className="absolute left-0 z-1 h-full px-6 cursor-pointer hover:bg-green-100 active:bg-green-300 focus:outline-2 focus:outline-green-600"
			onClick={props.onBack}
		>
			<ArrowLeft className="size-5" />
		</button>
	);
}

function ProgressBar(props: { value: number }) {
	return (
		<div className="relative h-0.5 z-2">
			<div
				className="absolute transition-all left-0 h-full bg-green-700"
				style={{ width: `${props.value ?? 0}%` }}
			/>
		</div>
	);
}
