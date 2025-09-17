import { useEffect, useState } from "react";
import { API_LINK } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import Alert from "../../../part/Alert";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import { decode } from "he";
import Konfirmasi from "../../../part/Konfirmasi";
import AppContext_master from "../master-proses/MasterContext.jsx";
import AppContext_test from "./TestContext.jsx";
import AnimatedSection from "../../../part/AnimatedSection.jsx";

export default function DetailKelas({ withID, onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  const [activeCategory, setActiveCategory] = useState(null);
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [listKategoriProgram, setListKategoriProgram] = useState([]);
  const [listMateri, setlistMateri] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);

  const handleGoBack = () => {
    setIsBackAction(true);
    setShowConfirmation(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmation(false);
    onChangePage("index", withID);
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };

  const getListKategoriProgram = async (filter) => {
    try {
      while (true) {
        let data = await UseFetch(
          API_LINK + "KategoriProgram/GetKategoriByIDProgram",
          {
            page: withID.id,
            query: "",
            sort: "[Nama Kategori] asc",
            status: "Aktif",
          }
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar kategori program."
          );
        } else if (data === "data kosong") {
          setListKategoriProgram([]);
          break;
        } else if (data.length === 0) {
          setListKategoriProgram([]);
          break;
        } else {
          setListKategoriProgram(data);
          break;
        }
      }
    } catch (e) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getListKategoriProgram();
    };

    fetchData();
  }, []);

  const getDataMateriKategori = async (index) => {
    const kategoriKey = index;
    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Materi/GetDataMateriByKategori", {
          page: 1,
          status: "Semua",
          query: "",
          sort: "Judul",
          order: "asc",
          kategori: kategoriKey,
        });
        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar kategori program."
          );
        } else if (data === "data kosong") {
          setlistMateri([]);
          break;
        } else if (data.length === 0) {
          setlistMateri([]);
          break;
        } else {
          setlistMateri(data);
          setActiveCategory(kategoriKey);
          break;
        }
      }
    } catch (e) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  const toggleCategory = (kategoriKey) => {
    if (activeCategory === kategoriKey) {
      setActiveCategory(null);
    } else {
      setActiveCategory(kategoriKey);
      getDataMateriKategori(kategoriKey);
    }
  };

  const handleBacaMateri = (book) => {
    AppContext_test.materiId = book.Key;
    AppContext_master.materiId = book.Key;
    AppContext_test.refreshPage += 1;
    onChangePage("pengenalan", true, book.Key, true);
  };

  return (
    <AnimatedSection>
      <div className="app-container">
        <div
          className="header"
          style={{
            width: "100%",
            padding: "100px 60px",
            backgroundImage: `linear-gradient(rgb(0, 0, 0), rgba(0, 0, 0, 0)), url(${API_LINK}Upload/GetFile/${withID.gambar})`,
            objectFit: "cover",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right",
          }}
        >
          <>
            <div className="background">
              <h4
                style={{
                  color: "white",
                  paddingBottom: "0px",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.73)",
                }}
              >
                <button
                  style={{ backgroundColor: "transparent", border: "none" }}
                  onClick={handleGoBack}
                >
                  <i
                    className="fas fa-arrow-left mr-3"
                    style={{
                      color: "white",
                      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.73)",
                    }}
                  ></i>
                </button>
                {decode(withID.title ? withID.title : "")}
              </h4>
              <p
                style={{
                  color: "white",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.73)",
                }}
              >
                Program Studi : {decode(withID.ProgramStudi)}
              </p>
              <p
                style={{
                  color: "white",
                  fontSize: "14px",
                  textAlign: "justify",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.73)",
                }}
              >
                {decode(withID.desc).substring(0, 300)}
                {withID.desc.length > 300 && "..."}
              </p>

              <div className="">
                <button
                  className="btn btn-outline-primary mt-3"
                  type="button"
                  style={{
                    fontSize: "20px",
                    marginTop: "-10px",
                    color: "white",
                    borderColor: "white",
                  }}
                  onClick={() =>
                    document
                      .getElementById("materi")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Baca Materi
                </button>
              </div>
            </div>
          </>
        </div>
        <div className="container mt-4">
          <h3 style={{ fontWeight: "500", color: "#0A5EA8" }}>Tentang Kelas</h3>
          <p
            id="materi"
            style={{
              textAlign: "justify",
              marginTop: "20px",
              lineHeight: "30px",
            }}
          >
            {decode(withID.desc)}
          </p>
        </div>

        <div className="container mb-4">
          <h3 className="mb-4" style={{ fontWeight: "500", color: "#0A5EA8" }}>
            Materi Kelas
          </h3>

          {listKategoriProgram.length > 0 ? (
            listKategoriProgram.map((kategori, index) => (
              <div
                key={index}
                className="section"
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  padding: "10px",
                  marginBottom: "10px",
                }}
                onClick={() => toggleCategory(kategori.Key)}
              >
                <div
                  className="section-header"
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                ></div>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#555",
                    fontWeight: "bold",
                  }}
                >
                  <i
                    className={`fas ${
                      activeCategory === kategori.Key
                        ? "fa-chevron-up"
                        : "fa-chevron-down"
                    } mr-3 ml-3`}
                    style={{
                      fontSize: "16px",
                    }}
                  ></i>
                  {decode(
                    kategori["Nama Kategori Program"]
                      ? kategori["Nama Kategori Program"]
                      : "Tidak ada deskripsi."
                  )}{" "}
                  <br />
                </p>
                {activeCategory === kategori.Key && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      borderTop: "1px solid #ccc",
                    }}
                  >
                    {listMateri.length > 0 ? (
                      listMateri
                        .filter((materi) => materi.Status === "Aktif")
                        .map((materi, materiIndex) => (
                          <div
                            className="d-flex"
                            key={materiIndex}
                            style={{
                              background: "#f9f9f9",
                              marginBottom: "8px",
                              padding: "8px",
                              borderRadius: "5px",
                            }}
                          >
                            <div className="">
                              <img
                                className="cover-daftar-kk"
                                style={{ borderRadius: "20px" }}
                                height="150"
                                src={`${API_LINK}Upload/GetFile/${materi.Gambar}`}
                                width="300"
                              />
                            </div>
                            <div className="ml-3" style={{ width: "120%" }}>
                              <p
                                style={{
                                  fontSize: "24px",
                                  fontWeight: "600",
                                  color: "#0A5EA8",
                                  margin: "0",
                                }}
                              >
                                {decode(
                                  materi.Judul
                                    ? materi.Judul
                                    : "Judul tidak tersedia"
                                )}
                              </p>
                              <p
                                style={{
                                  fontSize: "15px",
                                  color: "#555",
                                  width: "90%",
                                  textAlign: "justify",
                                }}
                              >
                                {decode(
                                  materi.Keterangan
                                    ? materi.Keterangan
                                    : "Deskripsi tidak tersedia"
                                )}
                              </p>
                            </div>
                            <div
                              className=""
                              style={{ width: "300px", marginTop: "40px" }}
                            >
                              <button
                                className="btn btn-outline-primary mt-2 ml-2"
                                type="button"
                                onClick={() => handleBacaMateri(materi)}
                              >
                                Baca Materi
                              </button>
                            </div>
                          </div>
                        ))
                    ) : (
                      <Alert
                        type="warning mt-3"
                        message="Tidak ada materi yang tersedia pada kategori ini"
                      />
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <Alert
              type="warning mt-3"
              message="Tidak ada kategori program yang tersedia"
            />
          )}
        </div>
        <>
          {isError.error && (
            <div className="flex-fill">
              <Alert type="danger" message={isError.message} />
            </div>
          )}
        </>
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
      </div>
    </AnimatedSection>
  );
}
