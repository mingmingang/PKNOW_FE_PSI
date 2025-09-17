import { useEffect, useState, useRef } from "react";
import KMS_Rightbar from "../../../part/RightBar";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import Input from "../../../part/Input";
import { object, string } from "yup";
import AppContext_test from "./TestContext";
import { API_LINK } from "../../../util/Constants";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import he from "he";
import maskotPknow from "../../../../assets/pknowmaskot.png";
import UseFetch from "../../../util/UseFetch";

const cleanText = (html) => {
  const decoded = he.decode(html);
  const tmp = document.createElement("DIV");
  tmp.innerHTML = decoded;
  const text = tmp.textContent || tmp.innerText || "";

  return text
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export default function Forum({ onChangePage, isOpen }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  AppContext_test.activeUser = activeUser;

  const [isError, setIsError] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState([]);
  const [marginRight, setMarginRight] = useState("6vh");
  const [replyMessage, setReplyMessage] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  async function updateProgres() {
    let success = false;
    let retryCount = 0;
    let maxRetries = 10;

    while (!success && retryCount < maxRetries) {
      try {
        const data = await UseFetch(
          API_LINK + "Materi/UpdatePoinProgresMateri",
          {
            materiId: AppContext_test.materiId,
            kry_user: activeUser,
            tipe: "Forum",
          }
        );

        if (data !== "ERROR") {
          success = true;
        } else {
          throw new Error("Failed to save progress");
        }
      } catch (error) {
        retryCount += 1;
      }
    }
  }

  useEffect(() => {
    updateProgres();
  }, []);

  const formDataRef = useRef({
    forumId: currentData[0]?.Key,
    karyawanId: AppContext_test.activeUser,
    isiDetailForum: "",
    statusDetailForum: "Aktif",
    createdBy: AppContext_test.activeUser,
    detailId: currentData[0]?.Key,
    isiBalasan: "",
  });

  const handleReply = (item) => {
    formDataRef.current = {
      forumId: item.Key,
      karyawanId: AppContext_test.activeUser,
      isiDetailForum: "",
      statusDetailForum: "Aktif",
      createdBy: AppContext_test.activeUser,
      detailId: item.DetailId,
      isiBalasan: item.IsiDetailForum,
    };
    setReplyMessage(`Membalas: ${item.IsiDetailForum}`);
    setShowReplyInput(true);
  };

  const handleReplySub = (item) => {
    formDataRef.current = {
      forumId: item.Key,
      karyawanId: AppContext_test.activeUser,
      isiDetailForum: "",
      statusDetailForum: "Aktif",
      createdBy: AppContext_test.activeUser,
      detailId: item.ChildDetailId,
      isiBalasan: item.IsiDetailForum,
    };
    setReplyMessage(`Membalas: ${item.IsiDetailForum}`);
    setShowReplyInput(true);
  };

  const [visibleReplies, setVisibleReplies] = useState([]);

  const handleCancelReply = () => {
    setReplyMessage("");
    formDataRef.current = {
      forumId: currentData[0]?.Key,
      karyawanId: AppContext_test.activeUser,
      isiDetailForum: "",
      statusDetailForum: "Aktif",
      createdBy: AppContext_test.activeUser,
      detailId: currentData[0]?.Key,
    };
    setShowReplyInput(false);
  };

  const userSchema = object({
    isiDetailForum: string(),
  });

  const handleSendReply = async (e) => {
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => {
        return { ...prevError, error: false };
      });
      setErrors({});
    }
    try {
      const data = await UseFetch(
        API_LINK + "Forum/SaveTransaksiForum",
        formDataRef.current
      );

      if (data === "ERROR") {
        throw new Error("Gagal mengirim balasan");
      }

      const updatedForumData = await fetchDataWithRetry();
      setCurrentData(updatedForumData);
      formDataRef.current.isiDetailForum = "";
      handleCancelReply();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentData) {
      formDataRef.current.forumId = currentData[0]?.Key;
      formDataRef.current.detailId = currentData[0]?.Key;
    }
  }, [currentData]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDataWithRetry();
        if (isMounted) {
          if (data) {
            if (Array.isArray(data)) {
              if (data.length === 0) {
              } else {
                setCurrentData(data);
              }
              return;
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

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [AppContext_test.materiId]);

  const fetchDataWithRetry = async (retries = 10, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const data = await UseFetch(API_LINK + "Forum/GetDataForum", {
          materiId: AppContext_test.materiId,
        });

        if (data !== "ERROR" && data.length !== 0) {
          setCurrentData(data);
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

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const renderMessages = () => {
    return currentData
      .filter((item) => item.ChildDetailId === item.Key)
      .map((item) => {
        const replyCount = currentData.filter(
          (reply) => reply.ChildDetailId === item.DetailId
        ).length;

        return (
          <div key={item.DetailId} className="">
            <div className="card p-3 mb-3">
              <div className="d-flex align-items-center ">
                <div>
                  <img src={maskotPknow} alt="" width="45px" className="mr-3" />
                </div>
                <div className="">
                  <h6
                    style={{
                      fontSize: "16px",
                      style: "bold",
                      textAlign: "left",
                    }}
                  >
                    {item.Nama}
                  </h6>
                  <h6 style={{ fontSize: "12px", color: "grey" }}>
                    {formatDate(item.CreatedDateDetailForum)}
                  </h6>
                </div>
              </div>
              <div className="mt-2">{item.IsiDetailForum}</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginLeft: "10px",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                }}
              >
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => handleReply(item)}
                  style={{ marginLeft: "52px" }}
                >
                  Balas
                </button>
              </div>

              {currentData
                .filter((reply) => reply.ChildDetailId == item.DetailId)
                .map((reply) => (
                  <div key={reply.DetailId} style={{ marginLeft: "30px" }}>
                    {visibleReplies.includes(reply.DetailId) && (
                      <div style={{ paddingBottom: "20px" }}>
                        <div className="d-flex align-items-center mt-4">
                          <div>
                            <img
                              src={maskotPknow}
                              alt=""
                              width="50px"
                              className="mr-3"
                            />
                          </div>
                          <div>
                            <div>
                              <h6
                                className="mb-1"
                                style={{ fontSize: "14px", fontWeight: "500" }}
                              >
                                {reply.Nama} -{" "}
                                {formatDate(reply.CreatedDateDetailForum)}
                              </h6>
                              <p
                                className="mb-2"
                                style={{ fontSize: "13px", color: "#666" }}
                              >
                                Membalas: {reply.IsiBalasanForum}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div
                          className="mb-0"
                          style={{
                            maxWidth: "1500px",
                            marginBottom: "0px",
                            fontSize: "14px",
                            textAlign: "left",
                            marginLeft: "10px",
                          }}
                        >
                          <div>
                            <div
                              className=""
                              style={{ marginLeft: "58px" }}
                              dangerouslySetInnerHTML={{
                                __html: reply.IsiDetailForum,
                              }}
                            />
                          </div>
                        </div>

                        <span
                          className="btn btn-outline-primary btn-sm mt-2"
                          onClick={() => handleReplySub(reply)}
                          style={{ marginLeft: "68px" }}
                        >
                          Balas
                        </span>
                      </div>
                    )}
                  </div>
                ))}

              {currentData.some(
                (reply) =>
                  reply.ChildDetailId === item.DetailId &&
                  !visibleReplies.includes(reply.DetailId)
              ) ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => handleShowReplies(item.DetailId)}
                >
                  <hr
                    style={{
                      flex: 1,
                      borderColor: "#0000EE",
                      color: "#0000EE",
                    }}
                  />
                  <span
                    style={{ marginLeft: "10px", color: "#0000EE" }}
                  >{`Balasan Lainnya (${replyCount})`}</span>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => handleHideReplies(item.DetailId)}
                >
                  <hr style={{ flex: 1, borderColor: "#0000EE" }} />
                  <span style={{ marginLeft: "10px", color: "#0000EE" }}>
                    Sembunyikan balasan
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      });
  };

  const handleShowReplies = (detailId) => {
    setVisibleReplies((prevReplies) => [
      ...prevReplies,
      ...currentData
        .filter((reply) => reply.ChildDetailId === detailId)
        .map((reply) => reply.DetailId),
    ]);
  };

  const handleHideReplies = (detailId) => {
    setVisibleReplies((prevReplies) =>
      prevReplies.filter(
        (replyId) =>
          !currentData
            .filter((reply) => reply.ChildDetailId === detailId)
            .map((reply) => reply.DetailId)
            .includes(replyId)
      )
    );
  };

  const renderJudulForum = () => {
    return currentData.slice(0, 1).map((item) => (
      <div key={item.DetailId} className="text-right">
        <div className="card p-3 mb-3" style={{ position: "sticky" }}>
          <div className="d-flex align-items-center mb-3 ml-2 ">
            <div>
              <img src={maskotPknow} alt="" width="50px" className="mr-3" />
            </div>
            <div>
              <h6 style={{ fontSize: "22px", textAlign: "left" }}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: he.decode(item.JudulForum),
                  }}
                />
              </h6>
              <h6 className="mb-0" style={nameStyle}>
                {item.CreatedByForum} - {formatDate(item.CreatedDateForum)}
              </h6>
            </div>
          </div>
          <div
            className="mb-0"
            style={{
              maxWidth: "1500px",
              marginBottom: "0px",
              fontSize: "14px",
              textAlign: "justify",
              marginLeft: "10px",
            }}
          >
            <div>
              <p>{cleanText(item.IsiForum)}</p>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const nameStyle = {
    textAlign: "left",
    fontSize: "12px",
    marginBottom: "15px",
    color: "grey",
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--responsiveContainer-margin-right",
      "10vw"
    );
    const sidebarMenuElement = document.querySelector(".sidebarMenu");
    if (sidebarMenuElement) {
      sidebarMenuElement.classList.add("sidebarMenu-hidden");
    }
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return new Intl.DateTimeFormat("id-ID", options).format(date);
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
            isActiveForum={true}
            isActiveSharing={false}
            isActiveSharingPDF={false}
            isActiveSharingVideo={false}
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
          }}
        >
          <div className="" style={{ marginTop: "100px" }}>
            <>
              <div style={{ marginRight: marginRight }}>
                {renderJudulForum()}
                {renderMessages()}
                <div style={{ marginTop: "20px" }}></div>
                {showReplyInput && (
                  <div
                    className="reply-batal"
                    style={{
                      bottom: "60px",
                      left: "15px",
                      zIndex: "999",
                      maxWidth: "100%",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      padding: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{ marginBottom: "20px", color: "gray", flex: "1" }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: replyMessage }} />
                    </p>

                    <div className="input-group-append">
                      <button
                        className="btn btn-danger btn-sm flex-end"
                        type="button"
                        onClick={handleCancelReply}
                        style={{ marginLeft: "100px", marginBottom: "20px" }}
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
                <div
                  className="mb-4"
                  style={{
                    bottom: "40px",
                    left: "15px",
                    zIndex: "999",
                    maxWidth: "100%",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Input
                    type="text"
                    forInput="isiDetailForum"
                    className="form-control"
                    placeholder="Ketik pesan..."
                    value={formDataRef.current.isiDetailForum}
                    errorMessage={errors.isiDetailForum}
                    onChange={handleInputChange}
                    style={{ flex: "1", marginRight: "10px" }}
                  />
                  <div className="">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={handleSendReply}
                      style={{ minWidth: "80px" }}
                    >
                      Kirim
                    </button>
                  </div>
                </div>
              </div>
            </>
          </div>
        </div>
      </div>
    </>
  );
}
