import { useState } from "react";
import budi from "../../assets/fotobudi.png";
import Konfirmasi from "./Konfirmasi";
import "../../style/PersetujuanKK.css";

export default function PersetujuanKK({ onChangePage }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirmApprove, setShowConfirmApprove] = useState(false);
  const [showConfirmReject, setShowConfirmReject] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

  const handleApprove = () => {
    setShowConfirmApprove(false);
  };

  const handleReject = () => {
    setShowConfirmReject(false);
  };

  const handleDetailsToggle = () => {
    setShowDetails(!showDetails);
  };

  const handleConfirmation = (action) => {
    if (action === "approve") {
      setShowConfirmApprove(true);
    } else if (action === "reject") {
      setShowConfirmReject(true);
    }
  };

  const handleDownload = (fileName) => {
    const link = document.createElement("a");
    link.href = `/path/to/your/files/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLeavePage = () => {
    setShowLeaveConfirmation(true);
  };

  const confirmLeavePage = () => {
    setShowLeaveConfirmation(false);
    onChangePage("index");
  };

  return (
    <>
      <div className="wait-accepted-layout">
        <div className="title-wait-accepted">
          <h1>Menunggu Persetujuan</h1>
          <p>2 Tenaga Pendidik Menunggu Persetujuan</p>
        </div>
        <div className="accepted-list-wait">
          <div className="list-wait">
            <div className="informasi-detail">
              <img src={budi} alt="Profile" />
              <div className="informasi">
                <h3>Riesta Nurul Arifah</h3>
                <p>Manajemen Informatika</p>
              </div>
            </div>
            <div className="action-accepted">
              <i
                className="fas fa-file-alt"
                title="Detail"
                onClick={handleDetailsToggle}
              ></i>
              <i
                className="fas fa-check"
                title="Correct"
                onClick={() => handleConfirmation("approve")}
              ></i>
              <i
                className="fas fa-times"
                title="Wrong"
                onClick={() => handleConfirmation("reject")}
              ></i>
            </div>
          </div>

          {showConfirmApprove && (
            <Konfirmasi
              title="Konfirmasi Persetujuan"
              pesan="Apakah Anda ingin menyetujui kelompok keahlian ini?"
              onYes={handleApprove}
              onNo={() => setShowConfirmApprove(false)}
            />
          )}

          {showConfirmReject && (
            <Konfirmasi
              title="Konfirmasi Penolakan"
              pesan="Apakah Anda ingin menolak pengajuan ini?"
              onYes={handleReject}
              onNo={() => setShowConfirmReject(false)}
            />
          )}

          {showLeaveConfirmation && (
            <Konfirmasi
              title="Konfirmasi Kembali"
              pesan="Apakah anda ingin meninggalkan halaman ini?"
              onYes={confirmLeavePage}
              onNo={() => setShowLeaveConfirmation(false)}
            />
          )}
        </div>
      </div>

      {showDetails && (
        <div className="detail-lampiran">
          <h1>Detail pengajuan dan lampiran pendukung</h1>
          <div className="group">
            <label>Nama</label>
            <input
              type="text"
              value="Riesta Pinky Nurul Arifah"
              readOnly
              className="input"
            />
          </div>
          <div className="group">
            <label>Lampiran 1</label>
            <button
              onClick={() => handleDownload("lampiran1.pdf")}
              className="download-button"
            >
              Unduh Lampiran 1
            </button>
          </div>
          <div className="group">
            <label>Lampiran 2</label>
            <button
              onClick={() => handleDownload("lampiran2.xlsx")}
              className="download-button"
            >
              Unduh Lampiran 2
            </button>
          </div>
          <div className="group">
            <label>Lampiran 3</label>
            <button
              onClick={() => handleDownload("lampiran3.pdf")}
              className="download-button"
            >
              Unduh Lampiran 3
            </button>
          </div>
          <div className="group">
            <label>Program Studi</label>
            <input type="text" value="Manajemen Informatika" readOnly />
          </div>

          <div className="accept-cancel-decline">
            <button
              type="reset"
              className="btn btn-cancel"
              onClick={() => setShowDetails(false)}
            >
              Batalkan
            </button>
            <div className="accept-decline-button">
              <button
                type="reset"
                className="btn btn-confirm"
                onClick={() => handleConfirmation("approve")}
              >
                Konfirmasi
              </button>
              <button
                type="reset"
                className="btn btn-danger"
                onClick={() => handleConfirmation("reject")}
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="back-page">
        <button
          type="reset"
          className="btn btn-cancel"
          onClick={handleLeavePage}
        >
          Kembali
        </button>
      </div>
    </>
  );
}
