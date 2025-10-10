import { useEffect, useState } from "react";
import { API_LINK } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import AppContext_test from "./TestContext";
import ReactPlayer from "react-player";
import KMS_Rightbar from "../../../part/RightBar";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import { decode } from "html-entities";

export default function MasterTestSharingVideo({
  onChangePage,
  CheckDataReady,
  materiId,
}) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState();
  const [fileExtension, setFileExtension] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  AppContext_test.refreshPage = "sharingVideo";

  const [fileData, setFileData] = useState({
    file: "",
  });

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

  useEffect(() => {
    updateProgres();
  }, []);

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
            tipe: "Sharing Expert",
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

  const getListSection = async (retries = 10, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await UseFetch(
          API_LINK + "Section/GetDataSectionByMateri",
          {
            mat_id: AppContext_test.materiId,
            sec_type: "Sharing Expert",
            sec_status: "Aktif",
          }
        );
        if (response !== "ERROR" && response.length !== 0) {
          return response;
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

  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        const sections = await getListSection();
        if (sections && sections.length > 0) {
          const fileFromResponse = sections[0]?.ExpertVideo || "";
          setCurrentData(sections[0]);
          setFileData({ file: fileFromResponse });
          setFileExtension(fileFromResponse.split(".").pop().toLowerCase());
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchSectionData();
  }, [AppContext_test.materiId]);

  useEffect(() => {}, [currentData]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("id-ID", options);
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
            isActiveSharing={true}
            isActiveSharingPDF={false}
            isActiveSharingVideo={true}
            isActiveMateri={false}
            isActiveMateriPDF={false}
            isActiveMateriVideo={false}
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
        <div
          className="d-flex flex-column flex-grow-1"
          style={{
            marginLeft:
              window.innerWidth >= 992 ? (isSidebarOpen ? "23%" : "0px") : "0",
            transition: "margin-left 0.3s",
            marginTop: "100px",
          }}
        >
          <h1 style={{ fontWeight: "600", color: "#002B6C" }}>
            Sharing Expert Video
          </h1>
          {currentData ? (
            <p className="mb-0">
              Dibuat oleh {decode(currentData.Nama)} -{" "}
              {formatDate(currentData.CreatedDate)}
            </p>
          ) : (
            <div></div>
          )}
          {fileData.file ? (
            <div
              style={{
                position: "relative",
                paddingTop: "56.25%",
                borderRadius: "20px",
                overflow: "hidden",
                margin: "10px",
              }}
            >
              <ReactPlayer
                url={`${API_LINK}Upload/GetFile/${fileData.file}`}
                playing={true}
                controls={true}
                width="100%"
                height="100%"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />
            </div>
          ) : (
            <div className="alert alert-warning mt-4 mb-4 ml-4">
              Tidak ada Sharing Expert Video yang tersedia.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
