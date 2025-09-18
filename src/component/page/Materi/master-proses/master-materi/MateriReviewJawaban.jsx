import { useState, useEffect } from "react";
import Loading from "../../../../part/Loading";
import Icon from "../../../../part/Icon";
import { Card, Button, Badge, Form } from "react-bootstrap";
import LocalButton from "../../../../part/Button copy";
import UseFetch from "../../../../util/UseFetch";
import AppContext_test from "../../master-test/TestContext";
import { API_LINK } from "../../../../util/Constants";
import Swal from "sweetalert2";
import Alert from "../../../../part/Alert";
import SweetAlert from "../../../../util/SweetAlert";
import he from "he";
import Cookies from "js-cookie";
import { decryptId } from "../../../../util/Encryptor";
import Search from "../../../../part/Search";

export default function MasterMateriReviewJawaban({
  onChangePage,
  status,
  withID,
}) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState([]);
  const [currentRespondentIndex, setCurrentRespondentIndex] = useState(0);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentAnswers, setCurrentAnswers] = useState([]);
  const [badges, setBadges] = useState([]);
  const [reviewStatus, setReviewStatus] = useState([]);
  const [formDataReview, setFormDataReview] = useState([]);
  const [dataQuiz, setDataQuiz] = useState([]);
  const [selectedQuizType, setSelectedQuizType] = useState("Pretest");

  const fetchDataQuiz = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await UseFetch(API_LINK + "Quiz/GetDataQuizByIdMateri", {
        materiId: AppContext_test.materiId,
      });

      if (response === "ERROR" || response.length === 0) {
        setDataQuiz([]);
      } else {
        setDataQuiz(response);
        if (response.length === 1) {
          setSelectedQuizType(response[0].quizTipe);
        }
      }
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const data = await fetchDataWithRetry();
        if (isMounted) {
          if (data && Array.isArray(data)) {
            if (!data || data.length === 0) {
              setIsError(true);
              setIsLoading(false);
              return;
            } else {
              const groupAnswer = {};
              data.forEach((answer) => {
                const trqId = answer.trq_id;
                if (!groupAnswer[trqId]) {
                  groupAnswer[trqId] = {
                    trq_id: trqId,
                    mat_id: answer.mat_id,
                    qui_id: answer.qui_id,
                    usr_id: answer.usr_id,
                    trq_status: answer.trq_status,
                    nilai: answer.trq_nilai,
                    qui_judul: answer.qui_judul,
                    trq_created_by: answer.trq_created_by,
                    qui_tipe: answer.qui_tipe,
                    nama: answer.Nama,
                    answer: [],
                  };
                }

                if (
                  !groupAnswer[trqId].answer.some(
                    (item) =>
                      item.ans_jawaban_pengguna === answer.ans_jawaban_pengguna
                  )
                ) {
                  groupAnswer[trqId].answer.push({
                    que_id: answer.que_id,
                    ans_jawaban_pengguna: answer.ans_jawaban_pengguna,
                    que_tipe: answer.que_tipe,
                  });
                }
              });

              setCurrentData(Object.values(groupAnswer));
              setBadges(
                Array(data.length)
                  .fill(null)
                  .map(() => Array(0).fill(0))
              );
              setReviewStatus(
                Array(data.length)
                  .fill(null)
                  .map(() => Array(0).fill(false))
              );
              await fetchQuestions(data[0].qui_id);
              await fetchAnswers(data[0].qui_tipe, data[0].usr_id);
            }
          } else {
            throw new Error("Data format is incorrect");
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
  }, [AppContext_test.materiId, AppContext_test.refresh, selectedQuizType]);

  const fetchDataWithRetry = async (retries = 1, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        setIsLoading(true);
        const response = await UseFetch(
          API_LINK + "Quiz/GetDataTransaksiReview",
          {
            materiId: AppContext_test.materiId,
            quiTipe: selectedQuizType,
          }
        );
        if (response === "ERROR" || response.length === 0) {
          setCurrentData([]);
          return [];
        }

        if (response.length !== 0) {
          setIsLoading(false);
          const filteredTransaksi = response.filter(
            (transaksi) =>
              transaksi.trq_status === "Not Reviewed" &&
              (transaksi.que_tipe === "Essay" ||
                transaksi.que_tipe === "Praktikum")
          );
          return filteredTransaksi;
        }
      } catch (error) {
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
    return [];
  };

  const fetchQuestions = async (questionType, retries = 10, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await UseFetch(API_LINK + "Quiz/GetDataQuestion", {
          quizId: questionType,
        });

        if (response !== "ERROR" && response.length !== 0) {
          const filteredQuestions = response.filter(
            (question) =>
              question.TipeSoal === "Essay" || question.TipeSoal === "Praktikum"
          );
          setCurrentQuestions(filteredQuestions);
          return;
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

  const fetchAnswers = async (
    questionType,
    karyawanId,
    retries = 10,
    delay = 1000
  ) => {
    for (let i = 0; i < retries; i++) {
      try {
        setIsLoading(true);
        const response = await UseFetch(API_LINK + "Quiz/GetDataResultQuiz", {
          quizId: AppContext_test.materiId,
          questionType: questionType,
          idKaryawan: karyawanId,
        });

        if (response !== "ERROR" && response.length !== 0) {
          const filteredAnswer = response.filter(
            (answer) => answer.Status === "Not Reviewed"
          );

          setIsLoading(false);
          setCurrentAnswers(filteredAnswer);
          return;
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
    fetchDataQuiz();
  }, []);

  useEffect(() => {
    if (selectedQuizType) {
      fetchDataWithRetry();
    }
  }, [selectedQuizType]);

  useEffect(() => {
    if (currentData.length > 0) {
      const quiTipe = currentData[0].qui_tipe;
      fetchQuestions(quiTipe);
    }
  }, [currentData]);

  useEffect(() => {
    if (currentData.length > 0) {
      fetchQuestions(currentData[currentRespondentIndex].qui_tipe);
      fetchAnswers(
        currentData[currentRespondentIndex].qui_tipe,
        currentData[currentRespondentIndex].usr_id
      );
    }
  }, [currentRespondentIndex, currentData]);

  const handlePreviousRespondent = () => {
    setCurrentRespondentIndex(
      (currentRespondentIndex - 1 + currentData.length) % currentData.length
    );
  };

  const handleNextRespondent = () => {
    setCurrentRespondentIndex(
      (currentRespondentIndex + 1) % currentData.length
    );
  };

  useEffect(() => {}, [badges, reviewStatus]);

  const handleSubmitAction = async () => {
    try {
      setIsLoading(true);
      for (const review of formDataReview) {
        const {
          idSoal,
          isCorrect,
          materiId,
          idKaryawan,
          idQuiz,
          idTransaksi,
          value,
        } = review;

        const response = await UseFetch(API_LINK + "Quiz/SaveReviewQuiz", {
          p1: idTransaksi,
          p2: idSoal,
          p3: isCorrect.toString(),
          p4: materiId,
          p5: idKaryawan,
          p6: idQuiz,
          p7: activeUser,
          p8: value,
        });

        if (response !== "ERROR") {
          SweetAlert(
            "Sukses",
            "Review jawaban telah berhasil disimpan!",
            "success"
          );
        }
      }
      setIsLoading(false);
      onChangePage("index");
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleSaveReview = () => {
    Swal.fire({
      title: "Apakah anda yakin sudah selesai?",
      text: "Penilaian akan disimpan dan tidak dapat diubah lagi.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, submit",
      cancelButtonText: "Tidak",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        handleSubmitAction();
      }
    });
  };

  const handleReview = (
    idSoal,
    isCorrect,
    karyawanId,
    quizId,
    transaksiId,
    scaleValue,
    value
  ) => {
    const updatedRespondent = { ...currentData[currentRespondentIndex] };
    const updatedReviewStatus = [...reviewStatus];
    updatedReviewStatus[currentRespondentIndex][idSoal] = isCorrect;
    setReviewStatus(updatedReviewStatus);
    const updatedBadges = [...badges];
    updatedBadges[currentRespondentIndex][idSoal] = isCorrect
      ? scaleValue
      : "salah";
    setBadges(updatedBadges);

    const detail = {
      idSoal: idSoal,
      isCorrect: isCorrect,
      materiId: AppContext_test.materiId,
      idKaryawan: karyawanId,
      idQuiz: quizId,
      idTransaksi: transaksiId,
      value: value,
    };
    setFormDataReview([...formDataReview, detail]);

    setCurrentData(
      currentData.map((respondent, index) =>
        index === currentRespondentIndex ? updatedRespondent : respondent
      )
    );
  };

  const handleAnswerChange = (questionIndex, value) => {
    const updatedRespondent = { ...currentData[currentRespondentIndex] };
    updatedRespondent.trq_jawaban_pengguna[questionIndex].Jawaban = value;
    setCurrentData(
      currentData.map((respondent, index) =>
        index === currentRespondentIndex ? updatedRespondent : respondent
      )
    );
  };

  const handleCancelReview = (idSoal) => {
    const updatedReviewStatus = [...reviewStatus];
    updatedReviewStatus[currentRespondentIndex][idSoal] = null;
    setReviewStatus(updatedReviewStatus);
    const index = formDataReview.findIndex(
      (detail) => detail.idSoal === idSoal
    );
    if (index !== -1) {
      formDataReview.splice(index, 1);
    }
    badges[idSoal] = null;
    const updatedBadges = [...badges];
    updatedBadges[currentRespondentIndex][idSoal] = "";
    setBadges(updatedBadges);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <>
        <div className="">
          <Search
            title="Review Quiz Materi"
            description="Tenaga Pendidik dapat memeriksa jawaban dari peserta yang telah mengerjakan Pre-Test dan Post-Test yang tersedia didalam materi."
            placeholder="Cari Kelompok Keahlian"
            showInput={false}
          />
        </div>
        <div className="d-flex justify-content-end">
          <div className=""></div>
          <div
            className=""
            style={{
              marginBottom: "0px",
              marginRight: "100px",
              marginTop: "25px",
            }}
          >
            {dataQuiz.length > 1 && (
              <>
                <div className="d-flex">
                  <div className="mr-3 mt-1 fw-bold">
                    <p style={{ color: "#0A5EA8" }}>Tipe Kuis :</p>
                  </div>
                  <div>
                    <Form.Select
                      value={selectedQuizType}
                      onChange={(e) => setSelectedQuizType(e.target.value)}
                    >
                      {dataQuiz
                        .sort((a, b) => {
                          if (a.quizTipe === "Pretest") return -1;
                          if (b.quizTipe === "Pretest") return 1;
                          return 0;
                        })
                        .map((quiz) => (
                          <option key={quiz.quizId} value={quiz.quizTipe}>
                            {quiz.quizTipe}
                          </option>
                        ))}
                    </Form.Select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div
          className="flex-fill mb-0 mt-3"
          style={{ marginRight: "100px", marginLeft: "100px" }}
        >
          <Alert
            type="warning"
            message="Belum terdapat peserta yang mengerjakan test"
          />
          <div className="float my-4 mx-1">
            <LocalButton
              classType="outline-secondary me-2 px-4 py-2"
              label="Kembali"
              onClick={() => onChangePage("index")}
            />
          </div>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <div className="">
          <Search
            title="Review Quiz Materi"
            description="Tenaga Pendidik dapat memeriksa jawaban dari peserta yang telah mengerjakan Pre-Test dan Post-Test yang tersedia didalam materi."
            placeholder="Cari Kelompok Keahlian"
            showInput={false}
          />
        </div>
        <div className="d-flex justify-content-end">
          <div className=""></div>
          <div
            className=""
            style={{
              marginBottom: "0px",
              marginRight: "100px",
              marginTop: "25px",
            }}
          >
            {dataQuiz.length > 1 && (
              <>
                <div className="d-flex">
                  <div className="mr-3 mt-1 fw-bold">
                    <p style={{ color: "#0A5EA8" }}>Tipe Kuis : </p>
                  </div>
                  <div className="">
                    <Form.Select
                      value={selectedQuizType}
                      onChange={(e) => setSelectedQuizType(e.target.value)}
                    >
                      {dataQuiz.map((quiz) => (
                        <option key={quiz.quizId} value={quiz.quizTipe}>
                          {quiz.quizTipe}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div
          className="flex-fill mb-0 mt-3"
          style={{ marginRight: "100px", marginLeft: "100px" }}
        >
          <Alert
            type="warning"
            message="Belum terdapat peserta yang mengerjakan test"
          />
          <div className="float my-4 mx-1">
            <LocalButton
              classType="outline-secondary me-2 px-4 py-2"
              label="Kembali"
              onClick={() => onChangePage("index")}
            />
          </div>
        </div>
      </>
    );
  }

  const currentRespondent = currentData[currentRespondentIndex];

  const removeHtmlTags = (str) => {
    if (!str) return "";
    const decoded = he.decode(str);
    return decoded.replace(/<\/?[^>]+(>|$)/g, "");
  };

  const decodeUserAnswer = (answer) => {
    if (!answer) return "Belum ada jawaban";
    try {
      const decoded = he.decode(answer);

      return decoded.replace(/<\/?[^>]+(>|$)/g, "");
    } catch (error) {
      return answer.replace(/<\/?[^>]+(>|$)/g, "");
    }
  };

  const downloadFile = async (namaFile) => {
    try {
      const response = await fetch(
        `${API_LINK}Upload/GetFile/${encodeURIComponent(namaFile)}`
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = namaFile;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {}
  };

  const scaleDescriptions = {
    0: "Salah",
    1: "Sangat Tidak Tepat (1/5)",
    2: "Tidak Tepat (2/5)",
    3: "Cukup Tepat (3/5)",
    4: "Tepat (4/5)",
    5: "Benar Sekali (5/5)",
  };

  const matchedAnswer = (question, currentRespondent) => {
    if (!currentData || !currentRespondent) return null;

    const answer = currentRespondent.answer.find(
      (ans) => ans.que_id === question.Key && ans.que_tipe === question.TipeSoal
    );
    return answer ? answer.ans_jawaban_pengguna : null;
  };

  return (
    <>
      <div className="">
        <Search
          title="Review Quiz Materi"
          description="Tenaga Pendidik dapat memeriksa jawaban dari peserta yang telah mengerjakan Pre-Test dan Post-Test yang tersedia didalam materi."
          placeholder="Cari Kelompok Keahlian"
          showInput={false}
        />
      </div>

      <div className="d-flex justify-content-end">
        <div className=""></div>
        <div
          className=""
          style={{
            marginBottom: "0px",
            marginRight: "70px",
            marginTop: "25px",
          }}
        >
          {dataQuiz.length > 1 && (
            <>
              <div className="d-flex">
                <div className="mr-3 mt-1 fw-bold">
                  <p style={{ color: "#0A5EA8" }}>Tipe Kuis :</p>
                </div>
                <div>
                  <Form.Select
                    value={selectedQuizType}
                    onChange={(e) => setSelectedQuizType(e.target.value)}
                  >
                    {dataQuiz
                      .sort((a, b) => {
                        if (a.quizTipe === "Pretest") return -1;
                        if (b.quizTipe === "Pretest") return 1;
                        return 0;
                      })
                      .map((quiz) => (
                        <option key={quiz.quizId} value={quiz.quizTipe}>
                          {quiz.quizTipe}
                        </option>
                      ))}
                  </Form.Select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="container mb-4" style={{ marginTop: "20px" }}>
        <Card className="mb-4">
          <Card.Header
            className="text-light d-flex align-items-center justify-content-between"
            style={{ background: "#0A5EA8" }}
          >
            <div className="header-left">
              <h3>
                {currentData.length > 0 && currentData[0].qui_judul} -
                {currentData.length > 0 && currentData[0].qui_tipe === "Pretest"
                  ? "Pre Test"
                  : "Post Test"}
              </h3>
            </div>
            <div className="header-right" style={{ marginLeft: "auto" }}>
              <select
                className="form-select me-4 mt-4"
                value={currentRespondentIndex}
                onChange={(e) => {
                  const selectedIndex = parseInt(e.target.value, 10);
                  setCurrentRespondentIndex(selectedIndex);
                }}
                style={{ flex: "1" }}
              >
                {Object.values(currentData).map((respondent, index) => (
                  <option key={respondent.trq_id} value={index}>
                    {respondent.nama}
                  </option>
                ))}
              </select>
              <span className="text-light">
                <span className="ms-3">
                  <i className="bi bi-caret-right-fill"></i>
                </span>
                <span className="ms-3">
                  <i className="bi bi-three-dots"></i>
                </span>
              </span>
            </div>
            <div className="d-flex" style={{ marginLeft: "30px" }}>
              <Button
                variant="outline-light"
                onClick={handlePreviousRespondent}
                disabled={currentRespondentIndex === 0}
              >
                <Icon name={"caret-left"} />
              </Button>
              <Button
                variant="outline-light"
                className="ms-2"
                onClick={handleNextRespondent}
                disabled={currentRespondentIndex === currentData.length - 1}
              >
                <Icon name={"caret-right"} />
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {currentQuestions.map((question, questionIndex) => {
              const currentRespondent = currentData[currentRespondentIndex];
              const answer = matchedAnswer(question, currentRespondent);
              const decodedAnswer = decodeUserAnswer(answer);
              return (
                <Card key={question.Key} className="mb-4">
                  <Card.Header className="">
                    <div className="d-flex mb-2 justify-content-between">
                      <div className="d-flex">
                        <Badge
                          className="me-2"
                          style={{
                            backgroundColor:
                              question.TipeSoal === "Essay"
                                ? "#007bff"
                                : "#ffc107",
                            color: "white",
                          }}
                        >
                          {question.TipeSoal === "Essay"
                            ? "Essay"
                            : "Praktikum"}
                        </Badge>
                        {badges?.[currentRespondentIndex]?.[question.Key] && (
                          <Badge
                            bg={badges[currentRespondentIndex][question.Key]}
                            className="me-2"
                            style={{
                              backgroundColor:
                                badges?.[currentRespondentIndex]?.[
                                  question.Key
                                ] === "salah"
                                  ? "#dc3545"
                                  : badges?.[currentRespondentIndex]?.[
                                      question.Key
                                    ] >= 4
                                  ? "#28a745"
                                  : badges?.[currentRespondentIndex]?.[
                                      question.Key
                                    ] >= 1
                                  ? "#ffa200"
                                  : "#6c757d",
                              color: "white",
                            }}
                          >
                            {badges?.[currentRespondentIndex]?.[
                              question.Key
                            ] === "salah"
                              ? "Salah"
                              : badges?.[currentRespondentIndex]?.[
                                  question.Key
                                ] !== undefined
                              ? scaleDescriptions[
                                  badges[currentRespondentIndex][question.Key]
                                ] || "Belum Dinilai"
                              : "Belum Dinilai"}
                          </Badge>
                        )}
                      </div>

                      <div className="">
                        <Badge bg="secondary" className="me-2" style={{}}>
                          Maks. {question.NilaiJawaban} Point
                        </Badge>
                      </div>
                    </div>

                    <div className="d-flex flex-column">
                      <div className="">
                        {removeHtmlTags(he.decode(question.Soal))}
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <Form.Label>Jawaban:</Form.Label>
                      {question.TipeSoal === "Essay" ? (
                        <Form.Group controlId={`jawaban-${question.Key}`}>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={decodedAnswer || "Belum ada jawaban"}
                            onChange={(e) =>
                              handleAnswerChange(questionIndex, e.target.value)
                            }
                            disabled={true}
                          />
                        </Form.Group>
                      ) : (
                        <Form.Group
                          controlId={`file-${question.Key}`}
                          className=""
                        >
                          <Button
                            className="btn btn-primary"
                            onClick={() => {
                              if (answer) {
                                downloadFile(answer);
                              } else {
                                alert("Tidak ada file untuk diunduh");
                              }
                            }}
                          >
                            <i className="fi fi-rr-file-download me-2"></i>
                            {answer ? answer : "Tidak ada file"}
                          </Button>
                        </Form.Group>
                      )}
                    </Form>
                  </Card.Body>
                  <Card.Footer className="text-end">
                    {reviewStatus[currentRespondentIndex][question.Key] ==
                    null ? (
                      <>
                        <Button
                          variant="danger"
                          className="me-2 px-3"
                          onClick={() =>
                            handleReview(
                              question.Key,
                              false,
                              activeUser,
                              currentRespondent.qui_id,
                              currentRespondent.trq_id,
                              0,
                              "0"
                            )
                          }
                        >
                          Salah
                        </Button>
                        {[1, 2, 3, 4, 5].map((scale) => (
                          <Button
                            key={scale}
                            className="me-2 px-3"
                            style={{
                              background: scale >= 4 ? "#28a745" : "#ffa200",
                              border: "none",
                              color: "white",
                            }}
                            onClick={() =>
                              handleReview(
                                question.Key,
                                true,
                                activeUser,
                                currentRespondent.qui_id,
                                currentRespondent.trq_id,
                                scale,
                                (scale / 5).toString()
                              )
                            }
                          >
                            {scale}
                          </Button>
                        ))}
                      </>
                    ) : (
                      <Button
                        variant="outline-danger"
                        onClick={() => handleCancelReview(question.Key)}
                      >
                        Batal
                      </Button>
                    )}
                  </Card.Footer>
                </Card>
              );
            })}
          </Card.Body>
        </Card>
        <div
          className="float my-4 mx-1 d-flex"
          style={{ justifyContent: "space-between" }}
        >
          <LocalButton
            classType="outline-secondary me-2 px-4 py-2"
            label="Kembali"
            onClick={() => onChangePage("index")}
          />
          <LocalButton
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="Simpan"
            onClick={handleSaveReview}
          />
        </div>
      </div>
    </>
  );
}
