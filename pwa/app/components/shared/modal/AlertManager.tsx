import { createPortal } from "react-dom";
import {
	createContext,
	type MouseEvent,
	type PropsWithChildren,
	type ReactElement,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { throwNotImplemented } from "~/utils/function";
import { Alert } from "~/components/shared/modal/Alert";
import { AnimatePresence, motion } from "motion/react";

const CONTEXT = createContext<{
	alert: (alert: ReactElement) => void;
	close: (alert: ReactElement) => void;
}>({
	alert: () => throwNotImplemented(),
	close: () => throwNotImplemented(),
});

export function AlertContext(props: PropsWithChildren) {
	const [enablePortal, setEnablePortal] = useState(false);
	const [alertsQueue, setAlertsQueue] = useState<ReactElement[]>([]);
	const lastAlert = alertsQueue.slice(-1)[0] ?? null;

	const ctxValue = useMemo(
		() => ({
			alert: (alert: ReactElement) => setAlertsQueue((st) => [...st, alert]),
			close: (alert: ReactElement) => setAlertsQueue((st) => st.filter((v) => v !== alert)),
		}),
		[],
	);

	useEffect(() => setEnablePortal(true), []);

	function onBackdropClick(e: MouseEvent) {
		e.stopPropagation();
		ctxValue.close(lastAlert);
	}

	return (
		<AnimatePresence mode="wait">
			<CONTEXT.Provider value={ctxValue}>
				{props.children}
				{enablePortal &&
					createPortal(
						null !== lastAlert && (
							<motion.div className="fixed inset-0 z-50">
								<motion.div
									className="absolute z-0 bg-gray-950 inset-0 opacity-70"
									onClick={onBackdropClick}
									initial={{ opacity: 0 }}
									animate={{ opacity: 0.7 }}
									exit={{ opacity: 0 }}
								/>
								<motion.div
									className="absolute inset-0 scroll-auto flex items-center justify-center p-2 pointer-events-none"
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
								>
									{lastAlert}
								</motion.div>
							</motion.div>
						),
						document.body,
					)}
			</CONTEXT.Provider>
		</AnimatePresence>
	);
}

export function useAlert() {
	const { alert, close } = useContext(CONTEXT);

	return useCallback(
		(params: { title?: string; body?: ReactNode }) => {
			const alertElement = (
				<Alert onClose={() => close(alertElement)} title={params.title}>
					{params.body}
				</Alert>
			);

			alert(alertElement);
		},
		[alert],
	);
}
