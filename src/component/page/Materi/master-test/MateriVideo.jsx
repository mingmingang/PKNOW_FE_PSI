import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import Alert from "../../../part/Alert";
import Loading from "../../../part/Loading";
import AppContext_test from "./TestContext";
import ReactPlayer from "react-player";
import KMS_Rightbar from "../../../part/RightBar";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import { decode } from "html-entities";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    Kategori: null,
    Judul: null,
    File_pdf: null,
    File_vidio: null,
    Pengenalan: null,
    Keterangan: null,
    "Kata Kunci": null,
    Gambar: null,
    Sharing_pdf: null,
    Sharing_vidio: null,
    Status: "Aktif",
    Count: 0,
  },
];

export default function MasterTestIndex({ onChangePage, materiId }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Kode Test] asc",
    status: "Aktif",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  let activeUser = "";
  const cookie = Cookies.get("activeUser");

  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const formUpdate = useRef({
    materiId: AppContext_test.materiId,
    karyawanId: AppContext_test.activeUser,
    totalProgress: "0",
    statusMateri_PDF: "",
    statusMateri_Video: "",
    statusSharingExpert_PDF: "",
    statusSharingExpert_Video: "",
    createdBy: "Fahriel",
  });

  useEffect(() => {
    const fetchData = async (retries = 3, delay = 1000) => {
      setIsError(false);
      setIsLoading(true);
      for (let i = 0; i < retries; i++) {
        try {
          const data = await UseFetch(API_LINK + "Materi/GetDataMateriById", {
            id: AppContext_test.materiId,
          });
          if (data.length !== 0) {
            setCurrentData({
              ...data[0],
              Nama: data[0].Nama || "Tidak ada uploader",
              Creadate: data[0].Creadate || "Tanggal tidak tersedia",
            });
          }
          return;
        } catch (error) {
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            setIsError(true);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [AppContext_test.refreshPage, currentFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  if (AppContext_test.progresMateri == "materi_video") {
    formUpdate.current.statusMateri_Video = "Done";
  } else {
    formUpdate.current.statusSharingExpert_Video = "Done";
  }

  async function saveProgress() {
    let success = false;
    let retryCount = 0;
    const maxRetries = 5;

    while (!success && retryCount < maxRetries) {
      try {
        const response = await UseFetch(
          API_LINK + "Materi/SaveProgresMateri",
          formUpdate.current
        );

        if (response !== "ERROR" && response != 0) {
          success = true;
          AppContext_test.refreshPage += retryCount;
        }
      } catch (error) {
        retryCount += 1;
      }
    }
  }

  async function updateProgres() {
    let success = false;
    let retryCount = 0;
    let maxRetries = 10;

    while (!success && retryCount < maxRetries) {
      try {
        const response = await UseFetch(
          API_LINK + "Materi/UpdatePoinProgresMateri",
          {
            materiId: AppContext_test.materiId,
            kry_user: activeUser,
            tipe: "Materi",
          }
        );
        if (response !== "ERROR") {
          success = true;
        }
      } catch (error) {
        retryCount += 1;
      }
    }
  }

  useEffect(() => {
    saveProgress();
    updateProgres();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <button
        className="d-lg-none btn btn-primary mb-3"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{
          position: "fixed",
          top: "100px",
          right: "15px",
          zIndex: 1000,
          color: "white",
          fontSize: "20px",
        }}
      >
        {isSidebarOpen ? "✕" : "☰"}
      </button>

      <div className="container">
        {isSidebarOpen && (
          <div
            className="d-lg-none"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 999,
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <div
          className={`${isSidebarOpen ? "d-block" : "d-none"} d-lg-block`}
          style={{
            position: isSidebarOpen ? "fixed" : "relative",
            zIndex: 999,
            backgroundColor: "white",
            height: isSidebarOpen ? "100vh" : "auto",
            overflowY: "auto",
            width: isSidebarOpen ? "350px" : "0px",
            left: isSidebarOpen ? "0" : "auto",
            top: isSidebarOpen ? "0" : "auto",
          }}
        >
          <KMS_Rightbar
            isActivePengenalan={false}
            isActiveForum={false}
            isActiveSharing={false}
            isActiveSharingPDF={false}
            isActiveSharingVideo={false}
            isActiveMateri={true}
            isActiveMateriPDF={false}
            isActiveMateriVideo={true}
            isActivePreTest={false}
            isActivePostTest={false}
            isOpen={true}
            onChangePage={onChangePage}
            materiId={AppContext_test.materiId}
            handlePreTestClick_open={() => setIsSidebarOpen(true)}
            handlePreTestClick_close={() => setIsSidebarOpen(false)}
            isCollapsed={!isSidebarOpen}
          />
        </div>

        <div className="">
          {isError && (
            <div className="">
              <Alert
                type="warning"
                message="Terjadi kesalahan: Gagal mengambil data Test."
              />
            </div>
          )}
          <div className=""></div>
          {isLoading ? (
            <Loading />
          ) : (
            <>
              <div
                className="d-flex flex-column flex-grow-1"
                style={{
                  marginLeft:
                    window.innerWidth >= 992
                      ? isSidebarOpen
                        ? "23%"
                        : "0px"
                      : "0",
                  transition: "margin-left 0.3s",
                  marginTop: "100px",
                }}
              >
                <h1 style={{ fontWeight: 600, color: "#002B6C" }} className="">
                  Materi Video {decode(currentData.Judul)}
                </h1>
                <h6 className="mb-0" style={{ color: "#002B6C" }}>
                  Dari {decode(currentData.NamaKK)} - {decode(currentData.Prodi)}
                </h6>
                <h6 style={{ color: "#002B6C" }} className="">
                  Oleh {decode(currentData.Nama)} -{" "}
                  {formatDate(currentData.Creadate)}
                </h6>
                {currentData.File_video ? (
                  <div className="mt-3" style={{ width: "100%" }}>
                    <ReactPlayer
                      url={`${API_LINK}Upload/GetFile/${currentData.File_video}`}
                      playing={true}
                      controls={true}
                      width="100%"
                      height="auto"
                      style={{
                        borderRadius: "10px",
                        maxWidth: "100%",
                      }}
                    />
                  </div>
                ) : (
                  <div className="alert alert-warning mt-4 mb-4">
                    Tidak ada Materi Video yang tersedia.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}