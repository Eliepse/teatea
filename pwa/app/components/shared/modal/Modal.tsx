import { createPortal } from "react-dom";
import clsx from "clsx";

type ModalType = React.PropsWithChildren & {
  open: boolean;
  noBackdrop?: boolean;
  position?: "top" | "bottom" | "middle" | "start" | "end";
  className?: string;
};

export function Modal(props: { open?: boolean; onClose: () => void } & ModalType) {
  if (true !== props.open) {
    return null;
  }

  return createPortal(<ModalContent {...props} open={props.open ?? false} />, document.body);
}

function ModalContent(props: ModalType) {
  const positionCls = clsx({
    "modal-open": props.open,
    "modal-end": "end" === props.position,
    "modal-start": "start" === props.position,
    "modal-top": "top" === props.position,
    "modal-middle": "middle" === props.position,
    "modal-bottom sm:modal-middle": "bottom" === props.position,
  });

  const { noBackdrop, ...dialogProps } = props;

  return (
    <dialog
      {...dialogProps}
      aria-label="Modal"
      // aria-hidden={ariaHidden}
      open={props.open}
      aria-modal={props.open}
      className={clsx("modal z-40", positionCls)}
    >
      <div className={clsx("modal-box", props.className)}>{props.children}</div>
      {true !== noBackdrop && (
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      )}
    </dialog>
  );
}
