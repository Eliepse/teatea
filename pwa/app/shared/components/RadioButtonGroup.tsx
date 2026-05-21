import { createContext, type PropsWithChildren, useContext, useMemo } from "react";
import clsx from "clsx";
import { f, fn } from "~/utils/function";

type ICTX = { value?: unknown; onSelect: (value: any) => void };
const CTX = createContext<ICTX>({ onSelect: fn });

export function RadioButtonGroup<T = string>(
	props: PropsWithChildren<{ className?: string; value?: T; onChange?: (value: T) => void }>,
) {
	const context = useMemo(
		() => ({ value: props.value, onSelect: (v: T) => f(props.onChange)(v) }),
		[props.value, props.onChange],
	);

	return (
		<CTX.Provider value={context}>
			<div className="flex bg-white border border-green-100 rounded-xl overflow-hidden shadow-xs">
				{props.children}
			</div>
		</CTX.Provider>
	);
}

export function RadioButton<T = string>(props: PropsWithChildren<{ className?: string; value: T }>) {
	const context = useContext(CTX);
	const isActive = undefined !== context.value && context.value === props.value;

	return (
		<button
			className={clsx(
				"flex-1 h-14 flex flex-col justify-center items-center leading-snug cursor-pointer",
				"font-medium hover:bg-green-200",
				isActive ? "text-white bg-green-600" : "text-base-content/80",
				// true !== props.readonly && !props.active && "hover:bg-green-200",
			)}
			onClick={() => context.onSelect(props.value)}
		>
			{props.children}
		</button>
	);
}
