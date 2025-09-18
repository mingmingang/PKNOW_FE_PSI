import { useEffect, useState } from "react";
import { API_LINK } from "../../../util/Constants";
import Button from "../../../part/Button copy";
import Table from "../../../part/Table";
import Alert from "../../../part/Alert";
import Loading from "../../../part/Loading";
import KMS_Rightbar from "../../../part/RightBar";
import UseFetch from "../../../util/UseFetch";
import AppContext_test from "./TestContext";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import "../../../../style/Table.css";
import { decode } from "html-entities";

export default function MasterTestPreTest({
  onChangePage,
  CheckDataReady,
  materiId,
}) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(0);
  const [dataDetailQuiz, setDataDetailQuiz] = useState(0);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function handleDetailAction(action, key) {
    if (action === "detail") {
      onChangePage("detailtest", "Posttest", AppContext_test.IdQuiz, key);
      AppContext_test.QuizType = "Posttest";
    }
  }

  async function onStartTest() {
    try {
      setIsLoading(true);
      const data = await UseFetch(API_LINK + "Quiz/SaveTransaksiQuiz", {
        karyawanId: activeUser,
        status: "",
        createdBy: activeUser,
        jumlahBenar: "",
      });

      if (data === "ERROR") {
        setIsError({
          error: true,
          message: "Terjadi kesalahan: Gagal menyimpan data Materi.",
        });
        return;
      }

      if (data[0]?.hasil === "OK") {
        await updateProgres();
        AppContext_test.dataIdTrQuiz = data[0].tempIDAlt;
        onChangePage(
          "pengerjaantest",
          "Posttest",
          currentData.materiId,
          currentData.quizId,
          currentData.timer,
          AppContext_test.dataIdTrQuiz,
          currentData.timer
        );
      } else {
        setIsError({
          error: true,
          message: "Terjadi kesalahan: Gagal menyimpan data Materi.",
        });
      }
    } catch (error) {
      setIsError({
        error: true,
        message: "Terjadi kesalahan: " + error.message,
      });
    } finally {
      setIsLoading(false);
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
              tipe: "Post-Test",
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
    document.documentElement.style.setProperty(
      "--responsiveContainer-margin-left",
      "0vw"
    );
    const sidebarMenuElement = document.querySelector(".sidebarMenu");
    if (sidebarMenuElement) {
      sidebarMenuElement.classList.add("sidebarMenu-hidden");
    }
  }, []);

  let idSection;

  useEffect(() => {
    let isMounted = true;
    let totalSoal = 0;

    const fetchData_posttest = async (retries = 10, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        setIsLoading(true);
        try {
          const data = await fetchDataWithRetry_posttest();
          if (isMounted) {
            if (data != "") {
              if (Array.isArray(data)) {
                if (data.length != 0) {
                  setTableData(
                    data.map((item, index) => ({
                      Key: item.IdTrq,
                      No: index + 1,
                      ["Tanggal Ujian"]: new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }).format(new Date(item["Tanggal Quiz"])),
                      Nilai: item.Status == "Reviewed" ? item.Nilai : "",
                      Keterangan:
                        item.Status == "Reviewed"
                          ? item.Nilai > 80
                            ? "Anda Lulus Kuis"
                            : "Tidak Lulus Kuis"
                          : "Sedang direview oleh Tenaga Pendidik",
                      Aksi: item.Status == "Reviewed" ? ["Detail"] : [""],
                      Alignment: [
                        "center",
                        "center",
                        "center",
                        "center",
                        "center",
                      ],
                    }))
                  );
                }
              }
            } else {
              setTableData([
                {
                  Key: "",
                  No: "",
                  ["Tanggal Ujian"]: "",
                  Nilai: "",
                  Keterangan: "",
                  Aksi: "",

                  Alignment: ["center", "center", "center", "center", "center"],
                },
              ]);
            }
          }
        } catch (error) {
          if (isMounted) {
            setIsError(true);
            if (i < retries - 1) {
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
              return;
            }
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }
    };

    const fetchDataWithRetry_posttest = async (retries = 15, delay = 500) => {
      for (let i = 0; i < retries; i++) {
        try {
          const data = await UseFetch(API_LINK + "Quiz/GetDataResultQuiz", {
            matId: AppContext_test.materiId,
            quiTipe: "Posttest",
            karyawanId: activeUser,
          });

          if (data !== "ERROR" && data.length !== 0) {
            setDataDetailQuiz(data);
            return data;
          }
        } catch (error) {
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            setError("Failed to fetch data after several retries.");
          }
        }
      }
    };

    const getListSection = async (retries = 10, delay = 2000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const data = await UseFetch(API_LINK + "Section/GetDataSectionByMateri", {
            mat_id: AppContext_test.materiId,
            sec_type: "Post-Test",
            sec_status: "Aktif",
          });

          if (data !== "ERROR" && data.length !== 0) {
            idSection = data[0].SectionId;
            return data;
          }
        } catch (error) {
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
    };

    const getQuiz_posttest = async (retries = 10, delay = 500) => {
      for (let i = 0; i < retries; i++) {
        try {
          const data = await UseFetch(API_LINK + "Quiz/GetDataQuizByIdSection", {
            section: idSection,
          });

          if (data !== "ERROR" && data.length > 0) {
            AppContext_test.IdQuiz = data[0].quizId;
            setCurrentData(data[0]);
            return data[0];
          }
        } catch (error) {
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
    };

    const initializeData = async () => {
      try {
        setIsLoading(true);
        await getListSection();
        const quizData = await getQuiz_posttest();

        if (quizData) {
          totalSoal = quizData.jumlahSoal;
          setCurrentData(quizData);
        }

        await fetchData_posttest();
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [AppContext_test.materiId]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("id-ID", options);
  };

  const convertToMinutes = (duration) => {
    AppContext_test.durasiTest = duration;
    return Math.floor(duration / 60);
  };

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

      <div className="container d-flex">
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
            isActiveMateri={false}
            isActiveMateriPDF={false}
            isActiveMateriVideo={false}
            isActivePreTest={false}
            isActivePostTest={true}
            isOpen={true}
            onChangePage={onChangePage}
            materiId={AppContext_test.materiId}
            handlePreTestClick_open={() => setIsSidebarOpen(true)}
            handlePreTestClick_close={() => setIsSidebarOpen(false)}
            isCollapsed={!isSidebarOpen}
          />
        </div>
      </div>
      <div className="d-flex flex-column">
        {isError && <div className=""></div>}
        {isLoading ? (
          <Loading message="Sedang memuat data..." />
        ) : currentData ? (
          <div
            className="d-flex flex-column flex-grow-1"
            style={{
              marginLeft:
                window.innerWidth >= 992 ? (isSidebarOpen ? "25%" : "5%") : "0",
              transition: "margin-left 0.3s",
            }}
          >
            <div className=" align-items-center mb-5">
              <div style={{ marginTop: "100px" }}>
                <div className="d-flex">
                  <div className="mt-2"></div>
                </div>
                <h2
                  className="mb-0 primary mt-4"
                  style={{ color: "#002B6C", fontWeight: "600" }}
                >
                  {decode(currentData.quizDeskripsi)}
                </h2>
                <br />
                <h6 className="mb-0" style={{ color: "#002B6C" }}>
                  Dari {decode(currentData.NamaKK)} -{" "}
                  {decode(currentData.Prodi)}
                </h6>
                <br />
                <h6
                  className="mb-2"
                  style={{ color: "#002B6C", marginTop: "-10px" }}
                >
                  Oleh {decode(currentData.Nama)} -{" "}
                  {formatDate(currentData.createdDate)}
                </h6>
                <p
                  className="mb-3"
                  style={{ textAlign: "justify", width: "98%" }}
                >
                  Post-test ini merupakan evaluasi akhir yang terdiri dari{" "}
                  {currentData.jumlahSoal} soal. Anda diberikan waktu total{" "}
                  {convertToMinutes(currentData.timer)} menit untuk
                  menyelesaikan semua soal tersebut. Waktu pengerjaan akan
                  dimulai secara otomatis saat Anda menekan tombol “Mulai
                  Post-Test” yang terletak di bawah instruksi ini. Post-Test
                  tidak akan dimulai hingga Anda siap dan memilih untuk
                  memulainya dengan mengklik tombol tersebut. Begitu tombol
                  ditekan, waktu akan mulai berjalan, dan Anda harus
                  menyelesaikan semua soal dalam jangka waktu yang telah
                  ditetapkan. Anda pelu mencapai <strong>80 Point</strong> untuk{" "}
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    Lulus
                  </span>{" "}
                  pada kuis ini.
                </p>
              </div>

              <Button
                classType="primary mt-2"
                label="Mulai Post-Test"
                onClick={onStartTest}
              />
            </div>
            <hr style={{ marginRight: "20px" }} />

            <div className="">
              <div className="mb-4">
                <h3
                  className=""
                  style={{ fontWeight: "600", color: "#002B6C" }}
                >
                  Riwayat
                </h3>
                <Table data={tableData} onDetail={handleDetailAction} />
              </div>
            </div>
          </div>
        ) : (
          <div className="" style={{ marginTop: "110px" }}>
            <Alert
              type="info"
              message="Saat ini belum tersedia Post Test pada Materi ini."
            />
          </div>
        )}
      </div>
    </>
  );
}
