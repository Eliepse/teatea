import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { throwNotImplemented } from "~/utils/function";

interface StackFrame {
	key: string;
	data?: unknown;
}

type ContextType = { stack: StackFrame[]; next: (frame: StackFrame) => void; back: () => void; reset: () => void };

type StackConfig<TFrame> = {
	defaultFrame: TFrame;
	onOverBack?: () => void;
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
			back: () =>
				setStack((st) => {
					if (1 === st.length) {
						config.onOverBack && config.onOverBack();
						return st;
					}

					return st.slice(0, -1);
				}),
			reset: () => setStack([config.defaultFrame]),
		}),
		[stack, config.onOverBack],
	);

	useEffect(() => {
		if (!import.meta.env.DEV) {
			return;
		}

		function forceFrame(key: StackFrame["key"]) {
			setStack((st) => [...st, { key }]);
		}
	}, []);

	return {
		NavigationStack: (props: PropsWithChildren) => (
			<StackContext.Provider value={contextValue}>{props.children}</StackContext.Provider>
		),
		...contextValue,
	};
}
