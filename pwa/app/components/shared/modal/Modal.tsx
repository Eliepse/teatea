import { createPortal } from "react-dom";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";

type ModalType = React.PropsWithChildren & {
	open: boolean;
	noBackdrop?: boolean;
	position?: "top" | "bottom" | "middle" | "start" | "end";
	className?: string;
};

export function Modal(props: { open?: boolean; onClose?: () => void } & ModalType) {
	return createPortal(
		<AnimatePresence mode="wait">
			{true === props.open && <ModalContent key="modal" {...props} open={props.open ?? false} />}
		</AnimatePresence>,
		document.body,
	);
}

function ModalContent(props: ModalType) {
	const positionCls = clsx({
		"modal-end": "end" === props.position,
		"modal-start": "start" === props.position,
		"modal-top": "top" === props.position,
		"modal-middle": "middle" === props.position,
		"modal-bottom sm:modal-middle": "bottom" === props.position,
	});

	const { noBackdrop, ...dialogProps } = props;

	return (
		<motion.dialog
			{...dialogProps}
			aria-label="Modal"
			aria-modal={props.open}
			className={clsx("modal z-40 modal-open transition-none", positionCls)}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			<motion.div
				initial={{ y: 32, scale: 1.01 }}
				animate={{ y: 0, scale: 1 }}
				exit={{ y: 64, scale: 1.02 }}
				transition={{
					duration: 0.32,
					delay: 0.04,
					ease: [0.22, 1, 0.36, 1],
				}}
				className={clsx("modal-box", props.className)}
			>
				{props.children}
			</motion.div>

			{true !== noBackdrop && (
				<form method="dialog" className="modal-backdrop">
					<button>close</button>
				</form>
			)}
		</motion.dialog>
	);
}
