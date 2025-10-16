import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { throwNotImplemented } from "~/utils/function";

interface StackFrame {
	key: string;
	data?: unknown;
}

type ContextType = { stack: StackFrame[]; next: (frame: StackFrame) => void; back: () => void; reset: () => void };

type StackConfig<TFrame> = {
	defaultFrame: TFrame;
};

const StackContext = createContext<ContextType>({
	stack: [],
	next: () => throwNotImplemented(),
	back: () => throwNotImplemented(),
	reset: () => throwNotImplemented(),
});

export function NavigationStack<TFrame extends StackFrame>(props: PropsWithChildren<StackConfig<TFrame>>) {
	const { NavigationStack } = useNavigationStack(props);
	return <NavigationStack>{props.children}</NavigationStack>;
}

export function StackFrame(props: PropsWithChildren<{ frameKey: string }>) {
	const navigationStack = useStackNavigator();

	if (navigationStack.current.key !== props.frameKey) {
		return null;
	}

	return props.children;
}

export function useStackNavigator() {
	const stackContext = useContext(StackContext);
	const current = stackContext.stack.slice(-1)[0] ?? undefined;
	return { current, ...stackContext };
}

/**
 * Allow creating a Navigation stack with a context accessible
 * directly, not only on children nodes.
 * You can use the <NavigationStack> component directly if you
 * don't need to control the stack outside of children.
 */
export function useNavigationStack(config: StackConfig<StackFrame>) {
	const [stack, setStack] = useState<StackFrame[]>([config.defaultFrame]);
	const contextValue = useMemo<ContextType>(
		() => ({
			stack,
			next: (frame: StackFrame) => {
				setStack((st) => [...st, frame]);
			},
			back: () => setStack((st) => (1 === st.length ? st : st.slice(0, -1))),
			reset: () => setStack([config.defaultFrame]),
		}),
		[stack],
	);

	useEffect(() => {
		if (!import.meta.env.DEV) {
			return;
		}

		function forceFrame(key: StackFrame["key"]) {
			setStack((st) => [...st, { key }]);
		}
	}, []);

	const component = useCallback(
		(props: PropsWithChildren) => (
			<StackContext.Provider value={contextValue}>{props.children}</StackContext.Provider>
		),
		[contextValue],
	);

	return {
		NavigationStack: component,
		...contextValue,
	};
}
