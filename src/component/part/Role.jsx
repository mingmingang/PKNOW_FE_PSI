import "../../style/Login.css";
import Modal from "./Modal";
import Button from "./Button";

export default function Role({ showModal, onClose }) {
  const modalRef = useRef();

  if (showModal) {
    modalRef.current?.open();
  } else {
    modalRef.current?.close();
  }

  return (
    <Modal
      ref={modalRef}
      title="Pilih Peran"
      size="medium"
      Button1={
        <Button
          classType="primary"
          label="Confirm"
          onClick={() => {
            modalRef.current.close();
            onClose();
          }}
        />
      }
    ></Modal>
  );
}
