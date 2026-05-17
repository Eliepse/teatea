import { createPortal } from "react-dom";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import styles from "./Modal.module.scss";
import type { PropsWithChildren } from "react";

type ModalType = PropsWithChildren & {
	open: boolean;
	noBackdrop?: boolean;
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
	const { noBackdrop, ...dialogProps } = props;

	return (
		<motion.dialog
			{...dialogProps}
			aria-label="Modal"
			aria-modal={props.open}
			className={styles.root}
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
				className={clsx(styles.modal, props.className)}
			>
				{props.children}
			</motion.div>

			{true !== noBackdrop && (
				<form method="dialog" className={styles.backdrop}>
					<button className="opacity-0">close</button>
				</form>
			)}
		</motion.dialog>
	);
}
