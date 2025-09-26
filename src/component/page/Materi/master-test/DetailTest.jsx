import { useEffect, useState } from "react";
import { API_LINK } from "../../../util/Constants";
import Button from "../../../part/Button copy";
import Input from "../../../part/Input";
import KMS_Sidebar from "../../../part/KMS_SideBar";
import styled from "styled-components";
import UseFetch from "../../../util/UseFetch";
import AppContext_test from "./TestContext";
import Cookies from "js-cookie";
import he from "he";
import { decryptId } from "../../../util/Encryptor";
import Search from "../../../part/Search";

const ButtonContainer = styled.div`
  bottom: 35px;
  display: flex;
  justify-content: space-between;
`;

const removeHtmlTags = (str) => {
  if (!str) return "";
  const decoded = he.decode(str);
  return decoded.replace(/<\/?[^>]+(>|$)/g, "");
};

export default function PengerjaanTest({
  onChangePage,
  quizType,
  materiId,
  quizId,
}) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [questionNumbers, setQuestionNumbers] = useState(0);
  const [totalQuestion, setTotalQuestion] = useState();
  const [answerStatus, setAnswerStatus] = useState([]);
  const [answerUser, setAnswerUser] = useState([]);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const selectPreviousQuestion = () => {
    if (selectedQuestion > 1) {
      setSelectedQuestion(selectedQuestion - 1);
    } else {
      setSelectedQuestion(selectedQuestion + totalQuestion - 1);
    }
  };

  const idTrq = quizId;
  AppContext_test.quizType = quizType;
  const selectNextQuestion = () => {
    if (selectedQuestion < totalQuestion) {
      setSelectedQuestion(selectedQuestion + 1);
    } else {
      setSelectedQuestion(selectedQuestion - totalQuestion + 1);
    }
  };
  const [selectedQuestion, setSelectedQuestion] = useState(1);

  useEffect(() => {
const handleResize = () => {
      setIsMobileView(window.innerWidth < 992);
    };

    handleResize(); 
    window.addEventListener("resize", handleResize); 

    document.documentElement.style.setProperty(
      "--responsiveContainer-margin-left",
      "0vw"
    );
    const sidebarMenuElement = document.querySelector(".sidebarMenu");
    if (sidebarMenuElement) {
      sidebarMenuElement.classList.add("sidebarMenu-hidden");
    }

    return () => {
      window.removeEventListener("resize", handleResize); 
    };
  }, []);

  const getSubmittedAnswer = (itemId) => {
    for (let i = 0; i < answerUser.length; i++) {
      if (answerUser[i].que_id === itemId) {
        return answerUser[i] ? answerUser[i].ans_jawaban_pengguna : "";
      }
    }
  };

  useEffect(() => {
    const fetchQuizData = async () => {
      setIsLoading(true);
      try {
        const questionResponse = await UseFetch(
          API_LINK + "Quiz/GetDataQuestion",
          {
            idQuiz: AppContext_test.IdQuiz,
          },
          "POST"
        );

        const answerResponse = await UseFetch(
          API_LINK + "Quiz/GetDataAnswer",
          {
            IdTrq: idTrq,
          },
          "POST"
        );

        if (questionResponse === "ERROR" || answerResponse === "ERROR") {
          throw new Error("Failed to fetch data");
        }

        const penggunaJawaban = answerResponse.map((item) => ({
          ans_id: item.ans_id,
          que_id: item.que_id,
          que_soal: removeHtmlTags(item.que_soal),
          ans_jawaban_pengguna: removeHtmlTags(item.ans_jawaban_pengguna || ""),
          ans_nilai: item.ans_nilai,
          ans_urutan: item.ans_urutan,
          ans_tipe: item.que_tipe,
        }));

        setAnswerUser(penggunaJawaban);

        if (questionResponse && Array.isArray(questionResponse)) {
          const questionMap = new Map();

          const transformedData = questionResponse
            .map((item) => {
              const {
                Soal,
                TipeSoal,
                Jawaban,
                UrutanJawaban,
                NilaiJawaban,
                NilaiJawabanOpsi,
                ForeignKey,
                Key,
                JawabanPengguna,
                TipePilihan,
                Gambar,
              } = item;

              if (!questionMap.has(Soal)) {
                questionMap.set(Soal, true);

                if (TipeSoal === "Essay") {
                  return {
                    type: "Essay",
                    question: removeHtmlTags(Soal),
                    correctAnswer: removeHtmlTags(Jawaban || ""),
                    answerStatus: "none",
                    point: NilaiJawaban,
                    id: Key,
                    jawabanPengguna_soal: penggunaJawaban.find(
                      (jawaban) =>
                        jawaban.que_soal === removeHtmlTags(Soal) &&
                        jawaban.que_id === Key
                    ),
                    gambar: Gambar,
                  };
                } else if (TipeSoal === "Praktikum") {
                  return {
                    type: "Praktikum",
                    question: removeHtmlTags(Soal),
                    correctAnswer: removeHtmlTags(Jawaban || ""),
                    answerStatus: "none",
                    point: NilaiJawaban,
                    id: Key,
                    jawabanPengguna_soal: penggunaJawaban.find(
                      (jawaban) =>
                        jawaban.que_soal === removeHtmlTags(Soal) &&
                        jawaban.que_id === Key
                    ),
                    gambar: Gambar,
                  };
                } else {
                  const options = questionResponse
                    .filter((choice) => choice.Key === item.Key)
                    .map((choice) => ({
                      value: removeHtmlTags(choice.Jawaban || ""),
                      urutan: choice.UrutanJawaban,
                      nomorSoal: choice.Key,
                      nilai: choice.NilaiJawabanOpsi,
                      id: Key,
                      opsi: TipePilihan,
                    }));

                  return {
                    type: "pilgan",
                    question: removeHtmlTags(Soal),
                    options: options,
                    correctAnswer: options.find(
                      (option) =>
                        option.value === removeHtmlTags(Jawaban || "") &&
                        option.nilai !== "0"
                    ),
                    urutan: UrutanJawaban,
                    nilaiJawaban: NilaiJawabanOpsi,
                    jawabanPengguna_value: penggunaJawaban
                      .filter(
                        (jawaban) =>
                          jawaban.que_soal === removeHtmlTags(Soal) &&
                          jawaban.que_id === Key
                      )
                      .map((jawaban) => jawaban.value),
                    jawabanPengguna_soal: penggunaJawaban.filter(
                      (jawaban) =>
                        jawaban.que_soal === removeHtmlTags(Soal) &&
                        jawaban.que_id === Key
                    ),
                    id: Key,
                  };
                }
              }
              return null;
            })
            .filter((item) => item !== null);

          setTotalQuestion(transformedData.length);
          setQuestionNumbers(transformedData.length);
          setCurrentData(transformedData);
          updateAnswerStatus(transformedData, penggunaJawaban);
        } else {
          throw new Error("Data format is incorrect");
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [idTrq]);

  const updateAnswerStatus = (questions, jawabanPengguna) => {
    const statusArray = questions.map((question, index) => {
      if (question.type === "Essay" || question.type === "Praktikum") {
        return "none";
      } else if (question.type === "pilgan") {
        const userAnswers = question.jawabanPengguna_soal || [];

        if (userAnswers.length === 0) {
          return "unanswered";
        }

        const hasCorrectAnswer = userAnswers.some((userAnswer) => {
          const selectedOption = question.options.find(
            (option) => option.urutan === userAnswer.ans_urutan
          );
          return (
            selectedOption &&
            selectedOption.nilai !== "0" &&
            selectedOption.nilai !== 0
          );
        });

        return hasCorrectAnswer ? "correct" : "incorrect";
      }
      return "none";
    });
    setAnswerStatus(statusArray);
  };

  const downloadFile = async (namaFile) => {
    try {
      const response = await fetch(
        `${API_LINK}Upload/GetFile/${encodeURIComponent(namaFile)}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("jwtToken"),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = namaFile;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) { }
  };

  AppContext_test.durasiTest = 10000;

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (isError.error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <div style={{ color: "red" }}>Error: {isError.message}</div>
      </div>
    );
  }

  return (
    <>
      <Search
        title="Hasil Kuis Materi"
        description="Anda akan mendapatkan hasil kuis yang telah anda kerjakan selama anda mengerjakannya sesuai dengan jawaban yang benar atau salah."
        placeholder="Cari Kelompok Keahlian"
        showInput={false}
      />

      {isMobileView && (
        <button
          className="btn mb-3"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          style={{
            position: "fixed",
            top: "100px",
            right: "20px",
            zIndex: 1000,
            borderRadius: "10%",
            width: "100px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0d6efd",
            color: "white",
          }}
        >
          {isMobileSidebarOpen ? "✕ " : "☰"}
          Soal
        </button>
      )}

      <div className="d-flex" style={{ marginTop: "20px", height: "60vh" }}>
        <div
          className="flex-fill p-3 d-flex flex-column"
          style={{ marginLeft: "4vw" }}
        >
          <div className="mb-3 d-flex flex-wrap" style={{ overflowX: "auto" }}>
            {currentData.map((item, index) => {
              if (index + 1 !== selectedQuestion) return null;
              const totalPoints = Array.isArray(item.jawabanPengguna_soal)
                ? item.jawabanPengguna_soal.reduce(
                  (sum, answer) => sum + (parseFloat(answer.ans_nilai) || 0),
                  0
                )
                : parseFloat(item.jawabanPengguna_soal?.ans_nilai || 0);
              return (
                <div
                  key={index}
                  className="mb-3"
                  style={{
                    display: "block",
                    verticalAlign: "top",
                    minWidth: "300px",
                    marginRight: "20px",
                  }}
                >
                  <div className="mb-3">
                    <h4
                      style={{
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        textAlign: "justify",
                      }}
                    >
                      <div className="">
                        <div className="">
                          {item.question}{" "}
                          {totalPoints > 0 ? (
                            <span
                              style={{
                                fontSize: "16px",
                                color: "green",
                                marginLeft: "8px",
                              }}
                            >
                              {totalPoints} Point
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: "16px",
                                color: "red",
                                marginLeft: "8px",
                              }}
                            >
                              Salah
                            </span>
                          )}
                        </div>
                      </div>
                    </h4>
                  </div>
                  {(item.type === "Essay" || item.type === "Praktikum") &&
                    item.gambar && (
                      <div>
                        <img
                          id="image"
                          src={API_LINK + `Upload/GetFile/${item.gambar}`}
                          alt="gambar"
                          className="img-fluid"
                          style={{
                            maxWidth: "500px",
                            maxHeight: "500px",
                            overflow: "hidden",
                            borderRadius: "20px",
                          }}
                        />
                      </div>
                    )}

                  {item.type === "Praktikum" ? (
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        downloadFile(
                          getSubmittedAnswer(item.id)
                            ? getSubmittedAnswer(item.id)
                            : "Tidak ada file"
                        )
                      }
                      style={{ marginTop: "25px" }}
                    >
                      <i className="fi fi-rr-file-download me-2"></i>
                      {getSubmittedAnswer(item.id)
                        ? getSubmittedAnswer(item.id)
                        : "Tidak ada jawaban"}
                    </button>
                  ) : item.type === "Essay" ? (
                    <Input
                      name="essay_answer"
                      type="textarea"
                      label="Jawaban Anda:"
                      value={getSubmittedAnswer(item.id)}
                      onChange={(event) =>
                        handleTextareaChange(event, index + 1, item.id)
                      }
                      disabled={true}
                    />
                  ) : (
                    <div className="d-flex flex-column">
                      {item.options.map((option, optionIndex) => {
                        if (option.opsi === "Tunggal") {
                          const isSelected = item.jawabanPengguna_soal.some(
                            (jawaban) => jawaban.ans_urutan === option.urutan
                          );
                          const isCorrect = option.nilai !== 0;

                          let borderColor1 = "lightgray";
                          let backgroundColor1 = "white";

                          if (isSelected) {
                            borderColor1 = isCorrect ? "#28a745" : "#dc3545";
                            backgroundColor1 = isCorrect
                              ? "#e9f7eb"
                              : "#f8d7da";
                          }

                          return (
                            <div
                              key={optionIndex}
                              className="mt-4 mb-2"
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <button
                                className="btn btn-outline-primary"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderColor: borderColor1,
                                  backgroundColor: backgroundColor1,
                                  color: borderColor1,
                                }}
                              >
                                {String.fromCharCode(65 + optionIndex)}
                              </button>
                              <span className="ms-2">{option.value}</span>{" "}
                            </div>
                          );
                        } else {
                          const isSelected = item.jawabanPengguna_soal.some(
                            (jawaban) => jawaban.ans_urutan === option.urutan
                          );
                          const isCorrect = option.nilai !== 0;

                          let borderColor1 = "lightgray";
                          let backgroundColor1 = "white";

                          if (isSelected) {
                            borderColor1 = isCorrect ? "#28a745" : "#dc3545";
                            backgroundColor1 = isCorrect
                              ? "#e9f7eb"
                              : "#f8d7da";
                          }

                          return (
                            <div
                              key={optionIndex}
                              className="mt-4 mb-2"
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                style={{
                                  marginLeft: "6px",
                                  marginRight: "10px",
                                  transform: "scale(1.5)",
                                  borderColor: borderColor1,
                                  backgroundColor: backgroundColor1,
                                  width: "20px",
                                  height: "20px",
                                  accentColor: isCorrect
                                    ? "#28a745"
                                    : "#dc3545",
                                }}
                              />
                              <span className="ms-2">{option.value}</span>{" "}
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <form>
            <div className=" my-4 mx-1 ">
              <ButtonContainer>
                <Button
                  classType="secondary me-2 px-4 py-2"
                  label="Sebelumnya"
                  onClick={selectPreviousQuestion}
                />
                <Button
                  classType="primary ms-2 px-4 py-2"
                  label="Selanjutnya"
                  onClick={selectNextQuestion}
                />
              </ButtonContainer>
            </div>
          </form>
        </div>
        {!isMobileView && (
          <div
            style={{
              height: "95%",
              width: "1px",
              backgroundColor: "#E4E4E4",
              margin: "0 auto",
            }}
          />
        )}
        {(!isMobileView || isMobileSidebarOpen) && (
          <div
            style={{
              position: isMobileView ? "fixed" : "relative",
              right: isMobileView ? "0" : "auto",
              top: isMobileView ? "0" : "auto",
              height: isMobileView ? "100vh" : "auto",
              width: isMobileView ? "100%" : "auto",
              backgroundColor: isMobileView ? "white" : "transparent",
              paddingTop: isMobileView ? "80px" : "0px",
              paddingLeft: isMobileView ? "-10px" : "0px",
              zIndex: 999,
              boxShadow: isMobileView ? "-5px 0 15px rgba(0,0,0,0.1)" : "none",
              overflowY: "auto",
            }}
          >

            <KMS_Sidebar
              onChangePage={onChangePage}
              questionNumbers={questionNumbers}
              selectedQuestion={selectedQuestion}
              setSelectedQuestion={setSelectedQuestion}
              answerStatus={answerStatus}
              checkMainContent="detail_test"
              quizId={AppContext_test.reviewQuizId}
              quizType={quizType}
            />
          </div>
        )}

        {isMobileView && isMobileSidebarOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 998,
            }}
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

      </div>
    </>
  );
}
