import { useState, useEffect } from "react";
import { API_LINK } from "../util/Constants";
import Icon from "./Icon";
import KMS_ProgressBar from "./ProgressBar";
import Cookies from "js-cookie";
import AppContext_test from "../page/master-test/TestContext";
import { decryptId } from "../util/Encryptor";
import "../../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import UseFetch from "../util/UseFetch";

export default function KMS_Rightbar({
  handlePreTestClick_close,
  handlePreTestClick_open,
  onChangePage,
  isOpen,
  materiId,
  refreshKey,
  setRefreshKey,
  isActivePengenalan = false,
  isActiveForum = false,
  isActiveSharing = false,
  isActiveSharingPDF = false,
  isActivePreTest = false,
  isActivePostTest = false,
  isActiveMateri = false,
  isActiveMateriPDF = false,
  isActiveMateriVideo = false,
  isActiveSharingVideo = false,
  isCollapsed: propIsCollapsed,
}) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  AppContext_test.activeUser = activeUser;

  const [showMainContent_SideBar, setShowMainContent_SideBar] =
    useState(isOpen);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState([]);
  const [sections, setSections] = useState([]);
  const [showMateriFile, setShowMateriFile] = useState(false);
  const [showMateriVideo, setShowMateriVideo] = useState(false);
  const [showSharingExpertFile, setShowSharingExpertFile] = useState(false);
  const [showSharingExpertVideo, setShowSharingExpertVideo] = useState(false);

  useEffect(() => {
    setShowMainContent_SideBar(isOpen);
  }, [isOpen]);

  const isDataReadyTemp = "";
  const materiIdTemp = "";
  const isOpenTemp = true;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      let materiData = null;
      let progresData = null;
      let maxRetries = 10;
      let retryCount = 0;
      if (materiId != null) {
        while ((!materiData || !progresData) && retryCount < maxRetries) {
          try {
            const [progresResponse] = await Promise.all([fetchProgresMateri()]);
            if (progresResponse) {
              progresData = progresResponse;
            }

            if (progresData) {
              setCurrentData(progresData);
            }
          } catch (error) {
            setIsError(true);
          }

          retryCount++;
          if (!progresData) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        setIsLoading(false);
      }
    };

    fetchData();
  }, [AppContext_test.materiId, AppContext_test.refreshPage]);

  const fetchProgresMateri = async () => {
    let success = false;

    while (!success) {
      try {
        const result = await UseFetch(API_LINK + "Materi/GetProgresMateri", {
          materiId: materiId,
          karyawanId: AppContext_test.activeUser,
        });

        if (result === "ERROR") {
          return null;
        }
        if (result) {
          success = true;
          return result;
        }
      } catch (error) {
        console.error(
          "Terjadi error tak terduga di fetchProgresMateri:",
          error
        );
        return null;
      }
    }
  };

  useEffect(() => {
    const fetchMateriData = async () => {
      const result = await UseFetch(`${API_LINK}Materi/GetDataMateriById`, {
        materiId: materiId,
      });

      if (result === "ERROR") {
        return;
      }

      if (result && Array.isArray(result) && result.length > 0) {
        const { File_pdf, File_video } = result[0];
        setShowMateriFile(!!File_pdf);
        setShowMateriVideo(!!File_video);
      }
    };

    if (materiId) {
      fetchMateriData();
    }
  }, [materiId]);

  useEffect(() => {
    const fetchSections = async () => {
      setIsLoading(true);
      setIsError(false);

      const result = await UseFetch(`${API_LINK}Section/GetDataSection`, {
        p1: materiId,
        p2: "Aktif",
      });

      if (result === "ERROR") {
        setIsError(true);
      } else if (result && Array.isArray(result)) {
        setSections(result);
        const secTypes = result.map((section) => section.SectionType);
        setShowPreTest(secTypes.includes("Pre-Test"));
        setShowSharing(secTypes.includes("Sharing Expert"));
        setShowPostTest(secTypes.includes("Post-Test"));

        const hasExpertFile = result.some((section) => section.ExpertFile);
        const hasExpertVideo = result.some((section) => section.ExpertVideo);
        setShowSharingExpertFile(hasExpertFile);
        setShowSharingExpertVideo(hasExpertVideo);
      }

      setIsLoading(false);
    };

    if (materiId) {
      fetchSections();
    } else {
      setIsLoading(false);
    }
  }, [materiId]);

  const listOfLearningStyle = {
    paddingLeft: "20px",
    paddingRight: "20px",
    display: "flex",
    alignItems: "center",
    paddingBottom: "5%",
  };

  const button_listOfLearningStyle = {
    backgroundColor: "white",
    color: "",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "40px",
    border: "1px solid #0A5EA8",
  };

  const [showPreTest, setShowPreTest] = useState(false);
  const [showPostTest, setShowPostTest] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [showSharingOptions, setShowSharingOptions] = useState(false);
  const [showMateriOptions, setShowMateriOptions] = useState(false);
  const [internalIsCollapsed, setIsCollapsed] = useState(false);
  const isCollapsed =
    propIsCollapsed !== undefined ? propIsCollapsed : internalIsCollapsed;

  const toggleSidebar = () => {
    if (propIsCollapsed === undefined) {
      setIsCollapsed(!isCollapsed);
    }
    if (isCollapsed) {
      handlePreTestClick_open();
    } else {
      handlePreTestClick_close();
    }
  };

  const onClick_exit = () => {
    onChangePage("index");
    AppContext_test.refreshPage += 1;
  };

  const onClick_Pretest = () => {
    onChangePage("pretest");
    AppContext_test.refreshPage += 1;
  };

  const onClick_Posttest = () => {
    onChangePage("posttest");
    AppContext_test.refreshPage += 1;
  };

  const onClick_Forum = () => {
    onChangePage("forum");
    AppContext_test.refreshPage += 1;
  };

  const onClick_Pengenalan = () => {
    onChangePage("pengenalan");
    AppContext_test.refreshPage += 1;
  };

  const onClick_materiPDF = () => {
    onChangePage("materipdf", isDataReadyTemp, materiIdTemp, isOpenTemp);
    AppContext_test.refreshPage = "materipdf";
  };

  const onClick_materiVideo = () => {
    onChangePage("materivideo", isDataReadyTemp, materiIdTemp, isOpenTemp);
    AppContext_test.refreshPage = "materivideo";
  };

  const onClick_sharingPDF = () => {
    onChangePage("sharingPDF", isDataReadyTemp, materiIdTemp, isOpenTemp);
    AppContext_test.refreshPage = "sharingPDF";
  };

  const onClick_sharingVideo = () => {
    onChangePage("sharingVideo", isDataReadyTemp, materiIdTemp, isOpenTemp);
    AppContext_test.refreshPage = "sharingVideo";
  };

  const onClick_close = () => {
    setShowSharingOptions((prevState) => !prevState);
  };

  const onClick_closeMateri = () => {
    setShowMateriOptions((prevState) => !prevState);
  };

  return (
    <div
      className="pt-2 overflow-y-auto bg-white"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: isCollapsed ? "60px" : "350px",
        transition: "width 0.3s ease",
        zIndex: 1000,
      }}
    >
      {isCollapsed ? (
        <div className="ml-3" style={{ marginTop: "100px" }}>
          <div style={button_listOfLearningStyle}>
            <Icon
              name="angle-right"
              type="Bold"
              cssClass="btn text-primary mt-1 mr-1"
              onClick={toggleSidebar}
            />
          </div>
        </div>
      ) : (
        <div className="collapseFalse" style={{ marginTop: "100px" }}>
          <div style={listOfLearningStyle}>
            <div style={button_listOfLearningStyle}>
              <Icon
                name="angle-left"
                type="Bold"
                cssClass="btn text-primary mt-1 mr-1"
                onClick={toggleSidebar}
              />
            </div>

            <span
              style={{ fontWeight: "600", color: "#002B6C", fontSize: "20px" }}
            >
              Daftar Pembelajaran
            </span>
          </div>
          <div className="ml-3 mr-3 mb-3">
            <h5 style={{ fontSize: "15px" }}>Progres</h5>
            <div>
              {currentData.map((item) => (
                <div key={item.Key} className="d-flex">
                  <KMS_ProgressBar progress={item.TotalProgres ?? 0} />
                  <div className="d-flex mt-1">
                    <span style={{ fontSize: "14px", marginLeft: "8px" }}>
                      {item.TotalProgres ?? 0}
                    </span>
                    <span style={{ fontSize: "12px" }}>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr style={{ margin: "10px 17px" }} />

          <div className="sidebar-content">
            <div className="ml-3 mr-3">
              <button
                className="buttonRightBar"
                style={{
                  backgroundColor: isActivePengenalan
                    ? "#0A5EA8"
                    : "transparent",
                  color: isActivePengenalan ? "white" : "black",
                }}
                onClick={onClick_Pengenalan}
              >
                Pengenalan Materi
              </button>
            </div>

            {showPreTest && (
              <div className="ml-3 mr-3 mt-3">
                <button
                  className="buttonRightBar"
                  style={{
                    backgroundColor: isActivePreTest
                      ? "#0A5EA8"
                      : "transparent",
                    color: isActivePreTest ? "white" : "black",
                  }}
                  onClick={onClick_Pretest}
                >
                  Pre-Test
                </button>
              </div>
            )}

            <div className="ml-3 mr-3 mt-3">
              <button
                className="buttonRightBar"
                style={{
                  backgroundColor: isActiveMateri ? "#0A5EA8" : "transparent",
                  color: isActiveMateri ? "white" : "black",
                }}
                onClick={onClick_closeMateri}
              >
                Materi <i className="fas fa-caret-down ml-2"></i>
              </button>
            </div>

            {showMateriOptions && (
              <>
                {showMateriFile && (
                  <div className="ml-3 mr-3 mt-3">
                    <button
                      className="buttonRightBar"
                      style={{
                        backgroundColor: isActiveMateriPDF
                          ? "#0A5EA8"
                          : "transparent",
                        color: isActiveMateriPDF ? "white" : "black",
                      }}
                      onClick={onClick_materiPDF}
                    >
                      Materi File
                    </button>
                  </div>
                )}

                {showMateriVideo && (
                  <div className="ml-3 mr-3 mt-3">
                    <button
                      className="buttonRightBar"
                      style={{
                        backgroundColor: isActiveMateriVideo
                          ? "#0A5EA8"
                          : "transparent",
                        color: isActiveMateriVideo ? "white" : "black",
                      }}
                      onClick={onClick_materiVideo}
                    >
                      Materi Video
                    </button>
                  </div>
                )}
              </>
            )}

            {showSharing && (
              <div className="ml-3 mr-3 mt-3">
                <button
                  className="buttonRightBar"
                  style={{
                    backgroundColor: isActiveSharing
                      ? "#0A5EA8"
                      : "transparent",
                    color: isActiveSharing ? "white" : "black",
                  }}
                  onClick={onClick_close}
                >
                  Sharing Expert <i className="fas fa-caret-down ml-2"></i>
                </button>
              </div>
            )}

            {showSharingOptions && (
              <>
                {showSharingExpertFile && (
                  <div className="ml-3 mr-3 mt-3">
                    <button
                      className="buttonRightBar"
                      style={{
                        backgroundColor: isActiveSharingPDF
                          ? "#0A5EA8"
                          : "transparent",
                        color: isActiveSharingPDF ? "white" : "black",
                      }}
                      onClick={onClick_sharingPDF}
                    >
                      Sharing Expert File
                    </button>
                  </div>
                )}
                {showSharingExpertVideo && (
                  <div className="ml-3 mr-3 mt-3">
                    <button
                      className="buttonRightBar"
                      style={{
                        backgroundColor: isActiveSharingVideo
                          ? "#0A5EA8"
                          : "transparent",
                        color: isActiveSharingVideo ? "white" : "black",
                      }}
                      onClick={onClick_sharingVideo}
                    >
                      Sharing Expert Video
                    </button>
                  </div>
                )}
              </>
            )}

            {showPostTest && (
              <div className="ml-3 mr-3 mt-3">
                <button
                  className="buttonRightBar"
                  style={{
                    backgroundColor: isActivePostTest
                      ? "#0A5EA8"
                      : "transparent",
                    color: isActivePostTest ? "white" : "black",
                  }}
                  onClick={onClick_Posttest}
                >
                  Post-Test
                </button>
              </div>
            )}

            <div className="ml-3 mr-3 mt-3">
              <button
                className="buttonRightBar"
                style={{
                  backgroundColor: isActiveForum ? "#0A5EA8" : "transparent",
                  color: isActiveForum ? "white" : "black",
                }}
                onClick={onClick_Forum}
              >
                Forum
              </button>
            </div>
            <div className="ml-3 mr-3 mt-3">
              <button
                className="buttonRightBar"
                style={{
                  backgroundColor: "transparent",
                  color: "black",
                }}
                onClick={onClick_exit}
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
