import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import type { PropsWithChildren } from "react";
import styles from "./ShortInfoModal.module.scss";
import clsx from "clsx";

export function ShortInfoModal(props: PropsWithChildren<{ open: boolean; onClose?: () => void; className?: string }>) {
	return createPortal(
		<AnimatePresence mode="wait">{props.open && <ModalContent key="modal" {...props} />}</AnimatePresence>,
		document.body,
	);
}

function ModalContent(props: PropsWithChildren<{ open: boolean; onClose?: () => void; className?: string }>) {
	return (
		<motion.dialog
			{...props}
			aria-label="Modal"
			aria-modal={props.open}
			className={styles.root}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			<motion.div
				initial={{ scale: 0.8 }}
				animate={{ scale: 1 }}
				exit={{ scale: 0.8 }}
				transition={{
					duration: 0.2,
					delay: 0.04,
					ease: [0.22, 1, 0.36, 1],
				}}
				className={styles.modalContainer}
			>
				<div className={clsx(styles.modal, props.className)}>{props.children}</div>
			</motion.div>

			<button
				className="fixed bottom-8 mx-auto rounded-2xl w-48 py-3 text-lg bg-green-400 text-green-900"
				onClick={props.onClose}
			>
				Ok!
			</button>

			<form method="dialog" className={styles.backdrop}>
				<button className="opacity-0">close</button>
			</form>
		</motion.dialog>
	);
}
