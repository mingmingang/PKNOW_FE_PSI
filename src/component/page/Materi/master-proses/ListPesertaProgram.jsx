import { useState, useEffect, useRef } from "react";
import pknowMaskot from "../../../../assets/pknowmaskot.png";
import BackPage from "../../../../assets/backPage.png";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import UseFetch from "../../../util/UseFetch";
import { API_LINK, APPLICATION_ID } from "../../../util/Constants";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Certificate from "../../../part/Certificate";
import SweetAlert from "../../../util/SweetAlert";
import Alert from "../../../part/Alert";

const inisialisasiData = [
  {
    ID: null,
    Nama: null,
    "Nomor Telepon": null,
    Username: null,
    "Tanggal Klaim": null,
    Count: 0,
  },
];

const ListPesertaProgram = ({ onChangePage, withID }) => {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [loadingStates, setLoadingStates] = useState({
    userData: true,
    programData: true,
    publikasiData: true,
    eksternalData: true,
    kategoriProgram: true,
  });

  const certificateRef = useRef();
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);

  const generateCertificate = async (participant) => {
    setGeneratingId(participant.ID);
    try {
      setSelectedParticipant({
        ...participant,
      });

      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(certificateRef.current, {
        width: 2000,
        height: 1414,
        scale: 1.1,
        logging: false,
        useCORS: true,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [2000, 1414],
      });
      pdf.addImage(imgData, "PNG", 0, 0, 2000, 1414);
      pdf.save(`Sertifikat-${participant.Nama}.pdf`);
    } catch (error) {
      SweetAlert(
        "Error",
        "Gagal menghasilkan sertifikat. Silakan coba lagi.",
        "error"
      );
    } finally {
      setGeneratingId(null);
    }
  };

  const handleFileChange = async (participant, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name;
    const fileExt = fileName.split(".").pop().toLowerCase();
    const allowedExts = ["pdf", "docx", "xlsx", "pptx"];

    if (!allowedExts.includes(fileExt)) {
      SweetAlert(
        "Error",
        "Format berkas tidak valid. Hanya PDF, DOCX, XLSX, PPTX yang diperbolehkan.",
        "error"
      );
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      SweetAlert("Error", "Berkas terlalu besar, maksimal 20MB", "error");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch(API_LINK + "Upload/UploadFile", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer " + Cookies.get("jwtToken"),
        },
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResponse.ok && uploadResult && uploadResult.Hasil) {
        const updateResult = await UseFetch(
          API_LINK + "Klaim/UpdateFileSertifKlaim",
          {
            p1: participant.klaim_id,
            p2: uploadResult.Hasil,
            p3: "approved",
            p4: activeUser,
          }
        );

        if (updateResult !== "ERROR") {
          SweetAlert(
            "Sukses",
            "Sertifikat berhasil diunggah dan status diperbarui",
            "success"
          );

          setCurrentData((prevData) =>
            prevData.map((p) =>
              p.ID === participant.ID
                ? {
                    ...p,
                    sertifikatStatus: "approved",
                    sertifikatFile: uploadResult.Hasil,
                  }
                : p
            )
          );
        } else {
          throw new Error("Gagal memperbarui data klaim");
        }
      } else {
        throw new Error("Gagal mengunggah file");
      }
    } catch (error) {
      SweetAlert(
        "Error",
        "Gagal mengunggah sertifikat. Silakan coba lagi.",
        "error"
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleGoBack = () => {
    onChangePage("kk", { Key: withID });
  };

  const handleCertificateAction = (id, action) => {
    setCurrentData((prevParticipants) =>
      prevParticipants.map((participant) => {
        if (participant.ID === id) {
          return {
            ...participant,
            sertifikatStatus: action,
            sertifikatFile:
              action === "approved" ? null : participant.sertifikatFile,
          };
        }
        return participant;
      })
    );
  };

  const [currentFilterProgram, setCurrentFilterProgram] = useState({
    page: withID.Key,
    query: "",
    sort: "[Waktu] desc",
    app: APPLICATION_ID,
    status: "Belum Dibaca",
  });

  const updateLoadingState = (key, value) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const fetchEksternalData = async () => {
      setIsError(false);
      updateLoadingState("eksternalData", true);
      try {
        const data = await UseFetch(
          API_LINK + "Klaim/GetUserEksKlaimByProgram",
          currentFilterProgram
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ID: value["ext_id"],
            Nama: value["ext_nama_lengkap"]
              ? decryptId(value["ext_nama_lengkap"])
              : value["ext_nama_lengkap"],
            "Nomor Telepon": value["ext_no_telp"],
            Username: value["ext_username"],
            progres: `${Math.round(value["total_progres"] || 0)}%`,
            skorQuiz: Math.round(value["total_quiz"] || 0),
            klaim_id: value["klaim_id"],
            sertifikatStatus: value["klaim_statussertif"],
            sertifikatFile: value["klaim_filesertif"],
          }));

          setCurrentData(formattedData);
        }
      } catch {
        setIsError(true);
      } finally {
        updateLoadingState("eksternalData", false);
      }
    };

    fetchEksternalData();
  }, [currentFilterProgram]);

  return (
    <div className="container mb-4" style={{ marginTop: "100px" }}>
      <div className="" style={{ display: "flex" }}>
        <button
          style={{ backgroundColor: "transparent", border: "none" }}
          onClick={handleGoBack}
        >
          <img src={BackPage} alt="" />
        </button>
        <h4
          style={{
            color: "#0A5EA8",
            fontWeight: "bold",
            fontSize: "30px",
            marginTop: "10px",
            marginLeft: "20px",
          }}
        >
          Daftar Peserta Program
        </h4>
      </div>
      {loadingStates.eksternalData ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : currentData.length === 0 ||
        (currentData.length === 1 && currentData[0].ID === null) ? (
        <div style={{ marginTop: "20px" }}>
          <Alert
            type="warning"
            message="Tidak ada peserta yang terdaftar dalam program ini."
          />
        </div>
      ) : (
        <div className="card mt-4">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ color: "#0A5EA8" }}>No</th>
                    <th style={{ color: "#0A5EA8" }}>Nama Peserta</th>
                    <th style={{ color: "#0A5EA8" }}>Progres</th>
                    <th style={{ color: "#0A5EA8", textAlign: "center" }}>
                      Skor Quiz
                    </th>
                    <th style={{ color: "#0A5EA8" }}>Status Sertifikat</th>
                    <th style={{ color: "#0A5EA8" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((participant, index) => (
                    <tr key={participant.ID}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={pknowMaskot}
                            alt={participant.Nama}
                            className="img-fluid rounded-circle me-3"
                            width="45"
                          />
                          <div>
                            <div>{participant.Nama}</div>
                            <small className="text-muted">
                              {participant.Username}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="progress" style={{ height: "20px" }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: participant.progres }}
                            aria-valuenow={parseInt(participant.progres)}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            {participant.progres}
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          className={`badge ${
                            participant.skorQuiz >= 80
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {participant.skorQuiz}
                        </span>
                      </td>

                      <td>
                        {parseInt(participant.progres) < 100 ? (
                          <span className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            Pembelajaran belum diselesaikan.
                          </span>
                        ) : participant.sertifikatStatus === "approved" ? (
                          <div>
                            {participant.sertifikatFile ? (
                              <span className="text-success">
                                <i className="bi bi-file-earmark-check me-1"></i>
                                {participant.sertifikatFile}
                              </span>
                            ) : (
                              <div className="input-group"></div>
                            )}
                          </div>
                        ) : participant.sertifikatStatus === "rejected" ? (
                          <span className="text-danger">
                            <i className="bi bi-x-circle me-1"></i>
                            Tidak dapat sertifikat
                          </span>
                        ) : (
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn"
                              style={{
                                background:
                                  "linear-gradient(45deg, #1e90ff, #007bff)",
                                color: "white",
                                border: "none",
                              }}
                              onClick={() =>
                                handleCertificateAction(
                                  participant.ID,
                                  "approved"
                                )
                              }
                            >
                              <i className="bi bi-check-circle me-1"></i> Acc
                            </button>
                            <button
                              className="btn"
                              style={{
                                background:
                                  "linear-gradient(45deg, #ff4d4d, #dc3545)",
                                color: "white",
                                border: "none",
                              }}
                              onClick={() =>
                                handleCertificateAction(
                                  participant.ID,
                                  "rejected"
                                )
                              }
                            >
                              <i className="bi bi-x-circle me-1"></i> Tolak
                            </button>
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="d-flex flex-column flex-md-row gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => generateCertificate(participant)}
                            disabled={generatingId === participant.ID}
                          >
                            {generatingId === participant.ID ? (
                              <span className="spinner-border spinner-border-sm me-1"></span>
                            ) : (
                              <i className="bi bi-file-earmark-pdf me-1"></i>
                            )}
                            Generate
                          </button>

                          <input
                            type="file"
                            className="form-control form-control-sm"
                            accept=".pdf,.docx,.xlsx,.pptx"
                            onChange={(e) => handleFileChange(participant, e)}
                            disabled={isUploading}
                            style={{ maxWidth: "220px" }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ position: "absolute", left: "-9999px" }}>
                {selectedParticipant && (
                  <Certificate
                    ref={certificateRef}
                    nama={selectedParticipant.Nama}
                    skorQuiz={selectedParticipant.skorQuiz}
                    program={withID["Nama Program"]}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPesertaProgram;
