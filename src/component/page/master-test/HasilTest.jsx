import { useEffect, useState } from "react";
import { API_LINK } from "../../../util/Constants";
import Button from "../../../part/Button copy";
import Loading from "../../../part/Loading";
import UseFetch from "../../../util/UseFetch";
import AppContext_test from "./TestContext";

export default function MasterTestHasilTest({
  onChangePage,
  quizType,
  materiId,
}) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [marginRight, setMarginRight] = useState("5vh");

  AppContext_test.refreshPage = "hasiltest";

  function lihatHasil() {
    onChangePage("detailtest", "Pretest", AppContext_test.materiId);
  }

  function formattingDate(rawDate) {
    let parsedDate = new Date(rawDate);
    let options = { day: "numeric", month: "long", year: "numeric" };
    let formattedDate = new Intl.DateTimeFormat("id-ID", options).format(
      parsedDate
    );
    return formattedDate;
  }

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const data = await fetchDataWithRetry();
        if (isMounted) {
          if (data && Array.isArray(data)) {
            if (data.length === 0) {
            } else {
              setCurrentData(data);
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const fetchDataWithRetry = async (retries = 10, delay = 5000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await UseFetch(API_LINK + "Quiz/GetDataResultQuiz", {
            quizId: AppContext_test.materiId,
            karyawanId: AppContext_test.activeUser,
            tipeQuiz: AppContext_test.quizType,
          });

          if (response !== "ERROR" && response.length !== 0) {
            AppContext_test.reviewQuizId = response[0].Key;
            return response;
          } else if (response === "ERROR") {
            throw new Error("Error fetching data");
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

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [AppContext_test.materiId]);

  useEffect(() => {}, [AppContext_test.materiId]);

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

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        currentData.map((item) => (
          <div key={item.Key} style={{ marginRight: marginRight }}>
            {item.Status === "Reviewed" ? (
              <div>
                <div
                  style={{
                    display: "flex-start",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "sans-serif",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "30px",
                    }}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        backgroundColor: "lightgray",
                        marginRight: "10px",
                      }}
                    ></div>
                    <div style={{ fontSize: "14px", color: "gray" }}>
                      {item.CreatedBy} - {formattingDate(item.CreatedDate)}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "18px", marginBottom: "20px" }}>
                      Selamat!, kamu mendapatkan nilai:
                    </div>
                    <div
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        border: "2px solid lightgray",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 30px",
                      }}
                    >
                      <div style={{ fontSize: "48px", fontWeight: "bold" }}>
                        {item.Nilai}
                      </div>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      Pre Test - Pemrograman 1
                    </div>
                    <div style={{ fontSize: "14px", marginBottom: "20px" }}>
                      Anda telah berhasil mengerjakan Pre Test, silahkan baca
                      materi yang telah disediakan dan kerjakan Post Test.
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <Button
                        classType="secondary me-2 px-4 py-2"
                        label="Lihat Hasil"
                        onClick={lihatHasil}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "30px",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      backgroundColor: "lightgray",
                      marginRight: "10px",
                    }}
                  ></div>
                  <div style={{ fontSize: "14px", color: "gray" }}>
                    {item.CreatedBy} - {formattingDate(item.CreatedDate)}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "sans-serif",
                    height: "50vh",
                    borderRadius: "10px",
                    padding: "20px",
                    margin: "20px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        marginBottom: "40px",
                        fontSize: "24px",
                        color: "#856404",
                        fontWeight: "bold",
                        border: "1px solid #ffeeba",
                        backgroundColor: "#fff3cd",
                        padding: "15px",
                        borderRadius: "5px",
                        textAlign: "center",
                      }}
                    >
                      Hasil akan direview oleh Tenaga Pendidik
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        marginBottom: "20px",
                        color: "#555",
                      }}
                    >
                      Anda telah berhasil mengerjakan Pre Test, silahkan baca
                      materi yang telah disediakan dan kerjakan Post Test.
                    </div>
                    <div
                      style={{ display: "flex", justifyContent: "center" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </>
  );
}
