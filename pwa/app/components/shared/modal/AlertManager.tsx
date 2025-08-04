import { createPortal } from "react-dom";
import {
	createContext,
	type MouseEvent,
	type PropsWithChildren,
	type ReactElement,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { throwNotImplemented } from "~/utils/function";
import { Alert } from "~/components/shared/modal/Alert";

const CONTEXT = createContext<{
	alert: (alert: ReactElement) => void;
	close: (alert: ReactElement) => void;
}>({
	alert: () => throwNotImplemented(),
	close: () => throwNotImplemented(),
});

export function AlertContext(props: PropsWithChildren) {
	const [alertsQueue, setAlertsQueue] = useState<ReactElement[]>([]);
	const currentAlert = alertsQueue[0] ?? null;

	const ctxValue = useMemo(
		() => ({
			alert: (alert: ReactElement) => setAlertsQueue((st) => [...st, alert]),
			close: (alert: ReactElement) => setAlertsQueue((st) => st.filter((v) => v !== alert)),
		}),
		[alertsQueue],
	);

	function onBackdropClick(e: MouseEvent) {
		console.debug("click")
		e.stopPropagation();
		ctxValue.close(currentAlert);
	}

	return (
		<CONTEXT.Provider value={ctxValue}>
			{props.children}
			{null !== currentAlert &&
				createPortal(
					<div className="fixed inset-0 z-50">
						<div className="absolute z-0 bg-gray-950 inset-0 opacity-70" onClick={onBackdropClick}></div>
						<div className="absolute inset-0 scroll-auto flex items-center justify-center p-2 pointer-events-none">
							{currentAlert}
						</div>
					</div>,
					document.body,
				)}
		</CONTEXT.Provider>
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
