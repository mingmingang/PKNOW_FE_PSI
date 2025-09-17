import { useState, useEffect } from "react";
import PDF_Viewer from "./PDF_Viewer";
import "../../style/DaftarPustaka.css";
import backPage from "../../assets/backPage.png";
import Konfirmasi from "./Konfirmasi";
import { API_LINK } from "../util/Constants";
import ReactPlayer from "react-player";
import WordViewer from "./DocumentViewer";
import ExcelViewer from "./ExcelViewer";
import axios from "axios";
import { decode } from "he";

export default function DetailDaftarPustaka({ onChangePage, withID }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState("Konfirmasi");
  const [pesanKonfirmasi, setPesanKonfirmasi] = useState(
    "Apakah Anda ingin meninggalkan halaman ini?"
  );
  const [fileExtension, setFileExtension] = useState("");

  const handleGoBack = () => {
    setIsBackAction(true);
    setShowConfirmation(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmation(false);
    onChangePage("index");
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };

  const [fileData, setFileData] = useState({
    key: "",
    judul: "",
    deskripsi: "",
    gambar: "",
    katakunci: "",
    file: "",
  });

  useEffect(() => {
    if (withID && withID.File && withID.Judul) {
      const ext = withID.File.split(".").pop().toLowerCase();
      const formattedFileName = `${withID.Judul.replace(/\s+/g, "_")}.${ext}`;

      setFileData({
        key: withID.id,
        judul: withID.Judul,
        deskripsi: withID.Keterangan,
        gambar: withID.Gambar,
        katakunci: withID.kataKunci,
        formattedFileName,
        file: withID.File,
      });

      setFileExtension(ext);
    }
  }, [withID]);

  const setupDownload = async (fileUrl, formattedFileName) => {
    try {
      const response = await axios.get(fileUrl, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = formattedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {}
  };

  return (
    <div className="container" style={{ marginTop: "100px" }}>
      <div className="back-title-daftar-pustaka">
        <button
          onClick={handleGoBack}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <img src={backPage} alt="Back" className="back" />
        </button>
        <h1 className="title">Knowledge Database</h1>
      </div>
      <div className="container card mb-4 py-4 px-3">
        <div className="pustaka-layout">
          <div className="daftar-pustaka-title-layout">
            <img
              src={`${API_LINK}Upload/GetFile/${fileData.gambar}`}
              alt="Daftar Pustaka"
              className="cover"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="detail-daftar-pustaka">
            <div className="detail-informasi-daftar-pustaka">
              <h3>Judul</h3>
              <p>{decode(fileData.judul)}</p>
            </div>
            <div className="detail-informasi-daftar-pustaka">
              <h3>Deskripsi</h3>
              <p style={{ textAlign: "justify" }}>
                {decode(fileData.deskripsi)}
              </p>
            </div>
            <div className="detail-informasi-daftar-pustaka">
              <h3>Kata Kunci</h3>
              <p>
                <span>
                  {Array.isArray(withID["Kata Kunci"])
                    ? withID["Kata Kunci"].join(", ")
                    : withID["Kata Kunci"]}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="file-preview">
          {fileExtension === "pdf" && (
            <PDF_Viewer pdfFileName={fileData.file} />
          )}
          {fileExtension === "mp4" && (
            <ReactPlayer
              url={`${API_LINK}Upload/GetFile/${fileData.file}`}
              playing={true}
              controls={true}
              width="100%"
              height="100%"
              style={{ borderRadius: "80px" }}
            />
          )}
          {fileExtension === "docx" && (
            <>
              <WordViewer
                fileUrl={`${API_LINK}Upload/GetFile/${fileData.file}`}
                fileData={fileData}
              />
            </>
          )}
          {fileExtension === "pptx" && (
            <>
              <p style={{ marginLeft: "25px", marginTop: "20px" }}>
                Dokumen Power Point tidak dapat ditampilkan di sini. Silahkan
                klik tombol dibawah ini untuk melihatnya.
              </p>
              <button
                onClick={() => {
                  setupDownload(
                    `${API_LINK}Upload/GetFile/${fileData.file}`,
                    fileData.formattedFileName
                  );
                }}
                style={{
                  border: "none",
                  backgroundColor: "#0E6EFE",
                  borderRadius: "10px",
                  padding: "10px",
                  marginLeft: "25px",
                  color: "white",
                }}
              >
                Unduh Pustaka
              </button>
            </>
          )}
          {fileExtension === "xlsx" && (
            <>
              <ExcelViewer
                fileUrl={`${API_LINK}Upload/GetFile/${fileData.file}`}
                fileData={fileData}
              />
            </>
          )}
        </div>
      </div>
      {showConfirmation && (
        <Konfirmasi
          title={isBackAction ? "Konfirmasi Kembali" : konfirmasi}
          pesan={isBackAction ? "Apakah anda ingin kembali?" : pesanKonfirmasi}
          onYes={handleConfirmYes}
          onNo={handleConfirmNo}
        />
      )}
    </div>
  );
}
