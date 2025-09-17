import { forwardRef, useImperativeHandle, useRef } from "react";
import "../../style/Login.css";

const Modal = forwardRef(function Modal(
  { title, children, size, Button1 = null, Button2 = null, onClose },
  ref
) {
  const dialog = useRef();
  let maxSize;

  switch (size) {
    case "small":
      maxSize = "600px";
      break;
    case "medium":
      maxSize = "720px";
      break;
    case "large":
      maxSize = "1024px";
      break;
    case "full":
      maxSize = "100%";
      break;
    default:
      maxSize = "600px";
  }

  useImperativeHandle(ref, () => {
    return {
      open() {
        dialog.current.showModal();
      },
      close() {
        dialog.current.close();
      },
    };
  });

  return (
    <dialog
      ref={dialog}
      className="custom-modal rounded-4"
      style={{ maxWidth: maxSize }}
    >
      <div className="custom-modal-header " style={{ fontWeight: "600" }}>
        {title}
      </div>
      <hr className="custom-divider" />
      <div className="custom-modal-body">{children}</div>
      <hr className="custom-divider" />
      <div className="custom-modal-footer">
        <form method="dialog">
          {Button1}
          {Button2}
          <div className="tutup">
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                dialog.current.close();
              }}
            >
              Tutup
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
});

export default Modal;
