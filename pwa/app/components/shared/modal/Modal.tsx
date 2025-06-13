import { createPortal } from "react-dom";
import clsx from "clsx";

type ModalType = React.PropsWithChildren & {
  open: boolean;
  backdrop?: boolean;
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

  const { backdrop, ...dialogProps } = props;

  return (
    <dialog
      {...dialogProps}
      aria-label="Modal"
      // aria-hidden={ariaHidden}
      open={props.open}
      aria-modal={props.open}
      className={clsx("modal", positionCls)}
    >
      <div className={clsx("modal-box", props.className)}>{props.children}</div>
      {true === backdrop && (
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      )}
    </dialog>
  );
}
