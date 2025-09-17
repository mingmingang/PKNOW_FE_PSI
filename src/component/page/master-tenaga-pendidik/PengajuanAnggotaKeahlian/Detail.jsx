import { useEffect, useState } from "react";
import UseFetch from "../../../util/UseFetch";
import Alert from "../../../part/Alert";
import Loading from "../../../part/Loading";
import Label from "../../../part/Label";
import { API_LINK } from "../../../util/Constants";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import BackPage from "../../../../assets/backPage.png";
import Konfirmasi from "../../../part/Konfirmasi";
import { decode } from "he";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "ID Lampiran": null,
    Lampiran: null,
    Karyawan: null,
    Status: null,
    Count: 0,
  },
];

export default function PengajuanDetail({ onChangePage, withID }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listNamaFile, setListNamaFile] = useState([]);
  const [detail, setDetail] = useState(inisialisasiData);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const [userData, setUserData] = useState({
    Role: "",
    Nama: "",
    kry_id: "",
  });

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

  const getUserKryID = async () => {
    setIsLoading(true);
    setIsError((prevError) => ({ ...prevError, error: false }));

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Utilities/GetUserLogin", {
          param: activeUser,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setUserData(data[0]);
          setIsLoading(false);
          break;
        }
      }
    } catch (error) {
      setIsLoading(true);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    }
  };

  useEffect(() => {
    getUserKryID();
  }, []);

  const decodeHtmlEntities = (str) => {
    const parser = new DOMParser();
    const decodedString = parser.parseFromString(str, "text/html").body
      .textContent;
    return decodedString || str;
  };

  const getListLampiran = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    setIsLoading(true);

    try {
      let data = await UseFetch(API_LINK + "PengajuanKK/GetDetailLampiran", {
        page: 1,
        sort: "[ID Lampiran] ASC",
        akk_id: withID.Key,
      });

      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil Detail Lampiran.");
      } else if (data.length === 0) {
        setListNamaFile([]);
      } else {
        const updatedData = data.map((item) => {
          if (item.Lampiran) {
            try {
              const cleanedLampiran = decodeHtmlEntities(item.Lampiran);
              const parsedLampiran = JSON.parse(cleanedLampiran);
              const fileUrls = parsedLampiran.map((file) => {
                return `${API_LINK}Upload/GetFile/${file.pus_file}`;
              });

              return { ...item, Lampiran: fileUrls };
            } catch (err) {
              return { ...item, Lampiran: [] };
            }
          }
          return item;
        });
        setDetail(updatedData);
      }
    } catch (error) {
      setDetail(null);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getListLampiran();
  }, [withID]);

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div
            className="container"
            style={{
              display: "flex",
              justifyContent: "space-between",
              maxWidth: "90%",
              marginBottom: "20px",
              marginTop: "100px",
            }}
          >
            <div className="back-and-title" style={{ display: "flex" }}>
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
                Pengajuan Kelompok Keahlian
              </h4>
            </div>
            <div className="ket-draft">
              <p
                className="mb-0"
                style={{ fontWeight: "600", marginTop: "10px" }}
              >
                <i
                  className="fas fa-circle"
                  icon="circle"
                  style={{
                    color: "#FFC107",
                    marginRight: "20px",
                    width: "10px",
                  }}
                />
                Menunggu Persetujuan Prodi
              </p>
            </div>
          </div>
          <div className="container mb-4">
            <form>
              <div className="card">
                <div className="card-body p-4">
                  <div className="row">
                    <div className="col-lg-6">
                      <Label title="Nama" data={userData.Nama} />
                    </div>
                    <div className="col-lg-6">
                      <Label title="Jabatan" data={userData.Role} />
                    </div>
                    <div className="col-lg-6 my-3">
                      <Label
                        title="Kelompok Keahlian"
                        data={decode(withID["Nama Kelompok Keahlian"])}
                      />
                    </div>
                    <div className="col-lg-6 my-3">
                      <Label
                        title="Status"
                        data={
                          withID.Status === "Menunggu Acc"
                            ? "Menunggu Persetujuan"
                            : withID.Status
                        }
                      />
                    </div>
                    <div className="col-lg-12">
                      <div className="fw-medium mb-2">Lampiran Pendukung</div>
                      <div className="card">
                        <div className="card-body p-4">
                          {detail?.map((item, index) => (
                            <div key={index}>
                              {item.Lampiran ? (
                                Array.isArray(item.Lampiran) ? (
                                  item.Lampiran.map((link, linkIndex) => (
                                    <div key={linkIndex}>
                                      <h5
                                        className="mb-3"
                                        style={{ marginTop: "15px" }}
                                      >{`Lampiran ${linkIndex + 1}`}</h5>
                                      <a
                                        href={link.trim()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-decoration-none fw-bold mb-4"
                                        style={{
                                          background: "white",
                                          color: "#0A5EA8",
                                          boxShadow:
                                            "0px 4px 6px rgba(0, 0, 0, 0.2)",
                                          fontSize: "18px",
                                          padding: "8px 10px",
                                          borderRadius: "10px",
                                          transition: "all 0.3s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.target.style.background = "#0A5EA8";
                                          e.target.style.color = "white";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.target.style.background = "white";
                                          e.target.style.color = "#0A5EA8";
                                        }}
                                      >
                                        {`Lampiran ${linkIndex + 1} ${
                                          withID["Nama Kelompok Keahlian"]
                                        }`}
                                      </a>
                                    </div>
                                  ))
                                ) : typeof item.Lampiran === "string" ? (
                                  item.Lampiran.split(",").map(
                                    (link, linkIndex) => (
                                      <div key={linkIndex}>
                                        <h5 className="mb-3">{`Lampiran ${
                                          index + 1
                                        }`}</h5>
                                        <a
                                          href={link.trim()}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {`Lampiran ${linkIndex + 1} ${decode(
                                            withID["Nama Kelompok Keahlian"]
                                          )}`}
                                        </a>
                                      </div>
                                    )
                                  )
                                ) : (
                                  <p>Invalid Lampiran format</p>
                                )
                              ) : (
                                <p>Tidak ada lampiran</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          {showConfirmation && (
            <Konfirmasi
              title={isBackAction ? "Konfirmasi Kembali" : "Konfirmasi Simpan"}
              pesan={
                isBackAction
                  ? "Apakah anda ingin kembali?"
                  : "Anda yakin ingin simpan data?"
              }
              onYes={handleConfirmYes}
              onNo={handleConfirmNo}
            />
          )}
        </>
      )}
    </>
  );
}
