import information from "../../assets/information.png";
import "../../style/Konfirmasi.css";

export default function Konfirmasi({ title, pesan, onYes, onNo }) {
  return (
    <div className="modal-confirmation">
      <div className="konfirmasi-box">
        <img src={information} alt="" />
        <h3>{title}</h3>
        <p>{pesan}</p>
        <div className="button-confirm">
          <button className="btn-yes" onClick={onYes}>
            Ya
          </button>
          <button className="btn-no" onClick={onNo}>
            Tidak
          </button>
        </div>
      </div>
    </div>
  );
}
