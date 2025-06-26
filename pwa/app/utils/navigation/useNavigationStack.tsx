import { useCallback, useState } from "react";

interface StackFrame {
	key: string;
}

export function useNavigationStack<TFrame extends StackFrame>(defaultFrame: TFrame) {
	const [stack, setStack] = useState<TFrame[]>([defaultFrame]);
	const current = stack.slice(-1)[0] ?? undefined;

	const back = useCallback(() => setStack((st) => st.slice(0, -1)), []);
	const goTo = useCallback((frame: TFrame) => setStack(st => [...st, frame]), []);
	const isFrame = useCallback((key: TFrame["key"]) => current?.key === key, [current]);
	const reset = useCallback(() => setStack([defaultFrame]), [defaultFrame]);

	return { stack, current, isFrame, back, goTo, reset };
}
