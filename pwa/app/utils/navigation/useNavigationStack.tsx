import { createContext, type PropsWithChildren, useContext, useMemo, useState } from "react";
import { throwNotImplemented } from "~/utils/function";

interface StackFrame {
	key: string;
}

type ContextType = { stack: StackFrame[]; next: (frame: StackFrame) => void; back: () => void; reset: () => void };

const StackContext = createContext<ContextType>({
	stack: [],
	next: () => throwNotImplemented(),
	back: () => throwNotImplemented(),
	reset: () => throwNotImplemented(),
});

export function NavigationStack<TFrame extends StackFrame>(props: PropsWithChildren<{ defaultFrame: TFrame }>) {
	const [stack, setStack] = useState<StackFrame[]>([props.defaultFrame]);

	const contextValue = useMemo<ContextType>(
		() => ({
			stack,
			next: (frame: StackFrame) => setStack((st) => [...st, frame]),
			back: () => setStack((st) => st.slice(0, -1)),
			reset: () => setStack([props.defaultFrame]),
		}),
		[stack],
	);

	return <StackContext value={contextValue}>{props.children}</StackContext>;
}

export function StackFrame(props: PropsWithChildren<{ frameKey: string }>) {
	const navigationStack = useNavigationStack();

	if (navigationStack.current.key !== props.frameKey) {
		return null;
	}

	return props.children;
}

export function useNavigationStack() {
	const stackContext = useContext(StackContext);
	const current = stackContext.stack.slice(-1)[0] ?? undefined;
	return { current, ...stackContext };
}
