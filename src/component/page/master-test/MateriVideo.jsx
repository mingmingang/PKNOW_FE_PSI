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

  return (
    <>
      <div className="container d-flex" style={{ height: "100vh" }}>
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
        />
        <div className="">
          {isError && (
            <div className="flex-fill">
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
                style={{
                  marginTop: "100px",
                  marginLeft: "20px",
                  marginBottom: "80px",
                }}
              >
                <h1 style={{ fontWeight: 600, color: "#002B6C" }}>
                  Materi Video {decode(currentData.Judul)}
                </h1>
                <h6 className="mb-3" style={{ color: "#002B6C" }}>
                  Dari {decode(currentData.NamaKK)} -{" "}
                  {decode(currentData.Prodi)}
                </h6>
                <h6 style={{ color: "#002B6C" }}>
                  Oleh {decode(currentData.Nama)} -{" "}
                  {formatDate(currentData.Creadate)}
                </h6>
                {currentData.File_video ? (
                  <ReactPlayer
                    url={`${API_LINK}Upload/GetFile/${currentData.File_video}`}
                    playing={true}
                    controls={true}
                    width="1000px"
                    maxwidth="1000px"
                    height="90%"
                    style={{
                      borderRadius: "80px",
                      marginTop: "5px",
                    }}
                  />
                ) : (
                  <div className="alert alert-warning mt-4 mb-4 ml-0">
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
