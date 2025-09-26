import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../util/Constants";
import { validateAllInputs } from "../../../util/ValidateForm";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import UploadFile from "../../../util/UploadFile";
import Button from "../../../part/Button copy";
import FileUpload from "../../../part/FileUpload";
import KMS_Sidebar from "../../../part/KMS_SideBar";
import styled from "styled-components";
import Swal from "sweetalert2";
import AppContext_test from "./TestContext";
import he from "he";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import Search from "../../../part/Search";
import Editor from "../../../part/CKEditor";

const ButtonContainer = styled.div`
  bottom: 35px;
  display: flex;
  justify-content: space-between;
`;

export default function PengerjaanTest({
  onChangePage,
  quizType,
  materiId,
  quizId,
  durasi,
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [editorData, setEditorData] = useState({});

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 992);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [questionNumbers, setQuestionNumbers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(false);
  const [fileAnswers, setFileAnswers] = useState({});
  const [createdBy, setCreatedBy] = useState("");

  const formDataRef = useRef({
    trqId: AppContext_test.dataIdTrQuiz,
    quizId: quizId,
    status: "Not Reviewed",
    karyawanId: activeUser,
    keterangan: "",
  });

  useEffect(() => {}, [quizType, materiId]);

  const formUpdate = useRef({
    idMateri: AppContext_test.materiId,
    karyawanId: activeUser,
    totalProgress: "0",
    statusMateri_PDF: "",
    statusMateri_Video: "",
    statusSharingExpert_PDF: "",
    statusSharingExpert_Video: "",
    createdBy: activeUser,
  });

  function convertEmptyToNull(obj) {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = value === "" ? null : value;
    }
    return newObj;
  }

  const processedFormUpdate = convertEmptyToNull(formUpdate);
  const fileInputRef = useRef(null);

  const userSchema = object({
    gambar: string(),
  });

  const handleSubmitConfirmation = () => {
    Swal.fire({
      title: "Apakah anda yakin sudah selesai?",
      text: "Jawaban akan disimpan dan tidak dapat diubah lagi.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, submit",
      cancelButtonText: "Tidak",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        handleAdd();
        handleSubmitAction();
      }
    });
  };

  useEffect(() => {}, [quizType, materiId]);

  useEffect(() => {
    if (timeRemaining == true) {
      handleAdd();
      handleSubmitAction();
    }
  }, [timeRemaining]);

  function handleSubmitAction() {
    if (quizType == "Pretest") {
      onChangePage("pretest", true, materiId);
      AppContext_test.refreshPage = "pretest";
    } else if (quizType == "Posttest") {
      onChangePage("posttest", true, materiId);
      AppContext_test.refreshPage = "posttest";
    }
  }

  const handleEditorChange = (data, index, itemId) => {
    setEditorData((prev) => ({
      ...prev,
      [`${index}-${itemId}`]: data,
    }));

    handleValueAnswer("0", itemId, "", "essay", index, data, itemId);
  };

  const handleFileChange = (
    ref,
    extAllowed,
    event,
    currentIndex,
    id_question
  ) => {
    const file = event.target.files[0];

    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      if (!extAllowed.includes(fileExtension)) {
        Swal.fire({
          title: "Format tidak valid!",
          text: `Harap unggah file dengan format yang diizinkan: ${extAllowed.join(
            ", "
          )}`,
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      setFileAnswers((prev) => ({
        ...prev,
        [`${currentIndex}-${id_question}`]: file,
      }));

      handleValueAnswer(
        "0",
        "",
        "",
        "Praktikum",
        currentIndex,
        event,
        id_question
      );
    }
  };

  const getUploadedFile = (currentIndex, id_question) => {
    return (
      fileAnswers[`${currentIndex}-${id_question}`]?.name ||
      "Tidak ada file yang dipilih"
    );
  };

  useEffect(() => {
    const checkStatus = () => {
      const hasEssayOrPraktikum = currentData.some(
        (item) => item.type === "Essay" || item.type === "Praktikum"
      );
      formDataRef.current.status = hasEssayOrPraktikum
        ? "Not Reviewed"
        : "Reviewed";
    };

    checkStatus();
  }, [currentData]);

  const handleAdd = async (e) => {
    await validateAllInputs(formDataRef.current, userSchema, setErrors);

    let countBenar = 0;
    let totalPoint = 0;
    const totalNilai = answers.reduce((accumulator, currentValue) => {
      const nilaiSelected = parseFloat(currentValue.nilaiSelected) || 0;
      if (nilaiSelected !== 0) {
        countBenar += 1;
        totalPoint += currentValue.nilaiSelected;
      }
      return accumulator + nilaiSelected;
    }, 0);
    if (formDataRef.current.status === "Reviewed") {
      if (countBenar < 80) {
        formDataRef.current.keterangan = "Tidak Lulus Quiz";
      } else {
        formDataRef.current.keterangan = "Lulus Quiz";
      }
    } else {
      formDataRef.current.status = "Not Reviewed";
    }

    let responseSave = false;

    const submittedAnswersFormatted = submittedAnswers.map((item) => ({
      ans_urutan: item[0],
      que_id: item[1],
      ans_jawaban_pengguna: item[2],
      ans_nilai: item[3],
      trq_id: item[4],
      ans_created_by: item[5],
      ans_tipe: item[6],
    }));

    while (!responseSave) {
      try {
        const data = await UseFetch(
          API_LINK + "Quiz/SaveDetailTransaksiQuiz",
          formDataRef.current
        );
        if (data !== "ERROR" && data.length != 0) {
          responseSave = true;
          try {
            const response = await UseFetch(API_LINK + "Quiz/UpdateNilaiQuiz", {
              idTrQuiz: AppContext_test.dataIdTrQuiz,
              jumlahBenar: countBenar,
              nilai: totalPoint,
            });
            if (response !== "ERROR" && response.length != 0) {
              responseSave = true;
            }
          } catch (error) {}
          for (let i = 0; i < submittedAnswersFormatted.length; i++) {
            try {
              const response = await UseFetch(
                API_LINK + "Quiz/SaveDataAnswer",
                submittedAnswersFormatted[i]
              );
            } catch (error) {}
          }
        }
      } catch (error) {}
    }

    const notifResponse = await UseFetch(
      API_LINK + "Utilities/createNotifikasi",
      {
        p1: "SENTTOTENAGAPENDIDIKFROMUSER",
        p2: "ID123458",
        p3: "APP64",
        p4: "PENGGUNA",
        p5: activeUser,
        p6: "Terdapat Test yang Perlu Direview",
        p7: "Review Hasil Test",
        p8: "Pengguna Menunggu Hasil Review Test",
        p9: "Dari Peserta Test",
        p10: "0",
        p11: "Jenis Lain",
        p12: activeUser,
        p13: "ROL25",
        p14: createdBy,
      }
    );

    if (notifResponse === "ERROR") {
      SweetAlert(
        "Error",
        "Gagal mengirimkan notifikasi ke  Tenaga Pendidik.",
        "error"
      );
      return;
    } else {
      SweetAlert(
        "Berhasil",
        "Tunggu Hasil Review Test dari Tenaga Pendidik.",
        "success"
      );
    }
  };

  const selectPreviousQuestion = () => {
    if (selectedQuestion > 1) {
      setSelectedQuestion(selectedQuestion - 1);
    } else {
      setSelectedQuestion(selectedQuestion + questionNumbers - 1);
    }
  };

  const selectNextQuestionOrSubmit = () => {
    if (selectedQuestion < questionNumbers) {
      setSelectedQuestion(selectedQuestion + 1);
    } else {
      handleSubmitConfirmation();
    }
  };

  const [selectedQuestion, setSelectedQuestion] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);

  useEffect(() => {}, [AppContext_test.arrayAnswerQuiz]);

  const handleValueAnswer = (
    urutan,
    idSoal,
    answer,
    nilaiSelected,
    index,
    file,
    id_question
  ) => {
    setSelectedOption(answer);

    const updatedAnswers = [...answers];
    const submitAnswer = [...submittedAnswers];
    const existingAnswerIndex = updatedAnswers.findIndex(
      (ans) => ans.idSoal === idSoal
    );

    if (file !== undefined && file !== null && nilaiSelected === "Praktikum") {
      const existingAnswerNonPilgan = updatedAnswers.findIndex(
        (ans) => ans.id_question === id_question
      );

      UploadFile(file.target).then((data) => {
        if (existingAnswerNonPilgan !== -1) {
          updatedAnswers[existingAnswerNonPilgan] = {
            urutan,
            id_question,
            answer,
            nilaiSelected,
          };
          submitAnswer[existingAnswerNonPilgan] = [
            urutan,
            id_question,
            data.Hasil,
            "0",
            AppContext_test.dataIdTrQuiz,
            activeUser,
            "Praktikum",
          ];
        } else {
          updatedAnswers.push({
            urutan,
            id_question,
            answer,
            nilaiSelected,
          });
          submitAnswer.push([
            urutan,
            id_question,
            data.Hasil,
            "0",
            AppContext_test.dataIdTrQuiz,
            activeUser,
            "Praktikum",
          ]);
        }

        setAnswers(updatedAnswers);
        setSubmittedAnswers(submitAnswer);
        AppContext_test.indexTest = index;
      });
      return;
    }

    if (nilaiSelected === "essay") {
      const existingAnswerNonPilgan = updatedAnswers.findIndex(
        (ans) => ans.id_question === id_question
      );

      if (existingAnswerNonPilgan !== -1) {
        updatedAnswers[existingAnswerNonPilgan] = {
          nilaiSelected,
          id_question,
          answer: file,
        };
        submitAnswer[existingAnswerNonPilgan] = [
          urutan,
          id_question,
          file,
          "0",
          AppContext_test.dataIdTrQuiz,
          activeUser,
          "Essay",
        ];
      } else {
        updatedAnswers.push({
          nilaiSelected,
          id_question,
          answer: file,
        });
        submitAnswer.push([
          urutan,
          id_question,
          file,
          "0",
          AppContext_test.dataIdTrQuiz,
          activeUser,
          "Essay",
        ]);
      }

      setAnswers(updatedAnswers);
      setSubmittedAnswers(submitAnswer);
      AppContext_test.indexTest = index;
      return;
    }

    const selectedAnswersForCurrentQuestion = updatedAnswers.filter(
      (ans) => ans.idSoal === idSoal
    );

    if (currentData[index - 1]?.options[0]?.cho_tipe === "Jamak") {
      const maxSelectable = currentData[index - 1]?.options.filter(
        (option) => parseFloat(option.nilai) !== 0
      ).length;

      if (selectedAnswersForCurrentQuestion.length >= maxSelectable) {
        const isAlreadySelected = selectedAnswersForCurrentQuestion.some(
          (ans) => ans.answer === answer
        );

        if (!isAlreadySelected) {
          Swal.fire({
            title: "Batas Tercapai",
            text: `Anda hanya dapat memilih ${maxSelectable} opsi.`,
            icon: "warning",
            confirmButtonText: "OK",
          });
          return;
        }
      }

      const existingAnswerIndex = updatedAnswers.findIndex(
        (ans) => ans.idSoal === idSoal && ans.answer === answer
      );

      if (existingAnswerIndex !== -1) {
        updatedAnswers.splice(existingAnswerIndex, 1);

        const submitIndex = submitAnswer.findIndex(
          (ans) => ans[1] === idSoal && ans[2] === answer
        );
        if (submitIndex !== -1) {
          submitAnswer.splice(submitIndex, 1);
        }
      } else {
        updatedAnswers.push({ urutan, idSoal, answer, nilaiSelected });
        submitAnswer.push([
          urutan,
          idSoal,
          answer,
          nilaiSelected,
          AppContext_test.dataIdTrQuiz,
          activeUser,
          "Pilgan",
        ]);
      }
    } else {
      const answersToRemove = updatedAnswers.filter(
        (ans) => ans.idSoal === idSoal
      );

      answersToRemove.forEach((ansToRemove) => {
        const indexToRemove = updatedAnswers.findIndex(
          (ans) =>
            ans.idSoal === ansToRemove.idSoal &&
            ans.answer === ansToRemove.answer
        );
        if (indexToRemove !== -1) {
          updatedAnswers.splice(indexToRemove, 1);
        }
      });

      const submitsToRemove = submitAnswer.filter((ans) => ans[1] === idSoal);

      submitsToRemove.forEach((submitToRemove) => {
        const indexToRemove = submitAnswer.findIndex(
          (ans) => ans[1] === submitToRemove[1]
        );
        if (indexToRemove !== -1) {
          submitAnswer.splice(indexToRemove, 1);
        }
      });

      updatedAnswers.push({ urutan, idSoal, answer, nilaiSelected });
      submitAnswer.push([
        urutan,
        idSoal,
        answer,
        nilaiSelected,
        AppContext_test.dataIdTrQuiz,
        activeUser,
        "Pilgan",
      ]);
    }

    setAnswers(updatedAnswers);
    setSubmittedAnswers(submitAnswer);
    AppContext_test.indexTest = index;
  };

  useEffect(() => {}, [submittedAnswers]);

  useEffect(() => {
    setAnswerStatus((prevStatus) => {
      const newStatus = [...prevStatus];
      newStatus[AppContext_test.indexTest - 1] = "answered";
      return newStatus;
    });
  }, [answers, AppContext_test.indexTest]);

  const [answerStatus, setAnswerStatus] = useState([]);

  useEffect(() => {
    const initialAnswerStatus = Array(questionNumbers).fill(null);
    setAnswerStatus(initialAnswerStatus);
  }, [questionNumbers]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await UseFetch(API_LINK + "Quiz/GetDataQuestion", {
          idQuiz: quizId,
        });
        await UseFetch(API_LINK + "Quiz/GetDataResultQuiz", {
          materiId: AppContext_test.materiId,
          karyawanId: activeUser,
        });
        if (data !== "ERROR" && Array.isArray(data)) {
          setCreatedBy(data[0]?.CreatedBy || "");
          AppContext_test.quizId = data[0].ForeignKey;
          const questionMap = new Map();
          const filePromises = [];

          const transformedData = data
            .map((item) => {
              const {
                Soal,
                TipeSoal,
                Jawaban,
                UrutanJawaban,
                NilaiJawaban,
                ForeignKey,
                Key,
                Gambar,
              } = item;
              if (!questionMap.has(Soal)) {
                questionMap.set(Soal, true);
                const question = {
                  id: Key,
                  type: TipeSoal,
                  question: Soal,
                  correctAnswer: Jawaban,
                  point: NilaiJawaban,
                  answerStatus: "none",
                  gambar: Gambar ? "" : null,
                };

                if (Gambar) {
                  const gambarPromise = API_LINK + `Upload/GetFile/${Gambar}`;

                  question.gambar = gambarPromise;
                  filePromises.push(gambarPromise);
                }

                if (TipeSoal === "Pilgan") {
                  question.options = data
                    .filter((choice) => choice.Key === item.Key)
                    .map((choice) => ({
                      value: choice.Jawaban,
                      urutan: choice.UrutanJawaban,
                      nomorSoal: choice.Key,
                      nilai: choice.NilaiJawabanOpsi,
                      cho_tipe: choice.TipePilihan,
                    }));
                  question.correctAnswer = question.options.find(
                    (option) => option.value === Jawaban && option.nilai !== "0"
                  );
                }
                return question;
              }
              return null;
            })
            .filter((item) => item !== null);

          await Promise.all(filePromises);

          setCurrentData(transformedData);
          setQuestionNumbers(transformedData.length);
        } else {
          throw new Error("Data format is incorrect");
        }
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    formDataRef.current.quizId = AppContext_test.quizId;
  }, [AppContext_test.quizId]);

  const getSubmittedAnswer = (itemId) => {
    const answer = submittedAnswers.find((answer) => answer[1] === itemId);
    return answer ? he.decode(answer[2]) : "";
  };

  const removeHtmlTags = (str) => {
    const decoded = he.decode(str);
    return decoded.replace(/<\/?[^>]+(>|$)/g, "");
  };

  return (
    <>
      <Search
        title="Kuis Materi"
        description="Berdoalah terlebih dahulu, pastikan anda menjawab jawaban yang paling tepat bagi anda. Penialaian anda akan menjadi bahan evaluasi pada materi ini."
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

      <div
        className="d-flex mt-3"
        style={{
          marginLeft: isMobileView ? "20px" : "100px",
          marginRight: isMobileView ? "20px" : "100px",
          height: "80vh",
          position: "relative",
          marginTop: "20px",
        }}
      >
        <div
          className="flex-fill p-3 d-flex flex-column"
          style={{ width: isMobileView ? "auto" : "910px", marginLeft: "4vw"}}
        >
          <div className="mb-3 d-flex" style={{ overflowX: "auto" }}>
            {currentData.map((item, index) => {
              const key = `${item.question}_${index}`;
              if (index + 1 !== selectedQuestion) return null;
              const totalPoints =
                item.type === "Pilgan" && item.options
                  ? item.options.reduce(
                      (sum, option) => sum + (parseFloat(option.nilai) || 0),
                      0
                    )
                  : item.type === "Essay" || item.type === "Praktikum"
                  ? parseFloat(item.point || 0)
                  : 0;

              const currentIndex = index + 1;
              return (
                <div
                  key={key}
                  className="mb-3"
                  style={{
                    display: "block",
                    marginRight: "20px",
                  }}
                >
                  <div className="mb-3">
                    <h4
                      style={{
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        textAlign: "justify",
                        color: "#002B6C",
                      }}
                    >
                      <div className="">
                        <span>{removeHtmlTags(he.decode(item.question))}</span>
                        <span
                          style={{
                            fontSize: "14px",
                            color: "#6c757d",
                            marginLeft: "8px",
                          }}
                        >
                          ({totalPoints} Points)
                        </span>
                      </div>
                    </h4>
                    {(item.type === "Essay" || item.type === "Praktikum") &&
                      item.gambar && (
                        <div>
                          <img
                            id="image"
                            src={item.gambar}
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
                  </div>

                  {item.type === "Praktikum" ? (
                    <FileUpload
                      forInput="jawaban_file"
                      label="Jawaban (.zip)"
                      formatFile=".zip"
                      hasExisting={getUploadedFile(index + 1, item.id)}
                      onChange={(event) =>
                        handleFileChange(
                          fileInputRef,
                          ["zip"],
                          event,
                          index + 1,
                          item.id
                        )
                      }
                      style={{ width: "105vh" }}
                    />
                  ) : item.type === "Essay" ? (
                    <div>
                      <label className="form-label">Jawaban Anda:</label>
                      <div style={{ width: "100%", maxWidth: "800px" }}>
                        <Editor
                          id={`editor-${index}-${item.id}`}
                          value={
                            editorData[`${index + 1}-${item.id}`] ||
                            getSubmittedAnswer(item.id)
                          }
                          onEditorChange={(data) =>
                            handleEditorChange(data, index + 1, item.id)
                          }
                          style={{
                            width: "100%",
                            minHeight: "250px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex flex-column">
                      {item.options[0].cho_tipe === "Jamak" && (
                        <div className="">
                          Pilihlah{" "}
                          {
                            item.options.filter(
                              (option) => parseFloat(option.nilai) !== 0
                            ).length
                          }{" "}
                          opsi jawaban.
                        </div>
                      )}

                      {item.options.map((option, index) => {
                        const isCorrect = option === item.correctAnswer;
                        const isSelected = answers.some(
                          (ans) =>
                            ans.idSoal == option.nomorSoal &&
                            ans.urutan == option.urutan
                        );

                        let borderColor1 = "";
                        let backgroundColor1 = "";

                        if (isSelected) {
                          borderColor1 = isCorrect ? "#28a745" : "#dc3545";
                          backgroundColor1 = isCorrect ? "#e9f7eb" : "#ffe3e6";
                        } else if (isCorrect && isSelected) {
                          borderColor1 = "#28a745";
                          backgroundColor1 = "#e9f7eb";
                        }

                        return (
                          <div
                            key={option.urutan}
                            className="mt-4 mb-2"
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {item.options[0].cho_tipe === "Tunggal" ? (
                              <>
                                <input
                                  type="radio"
                                  id={`option-${option.urutan}`}
                                  name={`question-${selectedQuestion}`}
                                  onChange={() =>
                                    handleValueAnswer(
                                      option.urutan,
                                      option.nomorSoal,
                                      option.value,
                                      option.nilai,
                                      currentIndex
                                    )
                                  }
                                  checked={isSelected}
                                  style={{ display: "none" }}
                                />
                                <label
                                  htmlFor={`option-${option.urutan}`}
                                  className={`btn btn-outline-primary ${
                                    isSelected ? "active" : ""
                                  }`}
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {String.fromCharCode(65 + index)}
                                </label>
                                <span
                                  className="ms-2"
                                  style={{
                                    wordWrap: "break-word",
                                    overflowWrap: "break-word",
                                  }}
                                >
                                  {option.value}
                                </span>
                              </>
                            ) : (
                              <>
                                <input
                                  type="checkbox"
                                  id={`option-${option.urutan}`}
                                  name={`question-${selectedQuestion}`}
                                  onChange={(e) =>
                                    handleValueAnswer(
                                      option.urutan,
                                      option.nomorSoal,
                                      option.value,
                                      option.nilai,
                                      currentIndex
                                    )
                                  }
                                  checked={isSelected}
                                  style={{
                                    marginLeft: "6px",
                                    marginRight: "10px",
                                    transform: "scale(2)",
                                    borderColor: "#000",
                                  }}
                                />
                                <span
                                  style={{
                                    wordWrap: "break-word",
                                    overflowWrap: "break-word",
                                  }}
                                >
                                  {option.value}
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <form onSubmit={handleAdd}>
                    <div className="mt-4">
                      <ButtonContainer>
                        <Button
                          style={{ backgroundColor: "transparent" }}
                          classType="outline-secondary me-2 px-4 py-2"
                          label="Sebelumnya"
                          onClick={selectPreviousQuestion}
                        />
                        <Button
                          classType="ms-2 px-4 py-2"
                          label={
                            selectedQuestion < questionNumbers
                              ? "Berikutnya"
                              : "Selesai"
                          }
                          onClick={selectNextQuestionOrSubmit}
                          style={{ backgroundColor: "#0d6efd", color: "white" }}
                        />
                      </ButtonContainer>
                    </div>
                  </form>
                </div>
              );
            })}            
          </div>
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
              questionNumbers={questionNumbers}
              selectedQuestion={selectedQuestion}
              setSelectedQuestion={setSelectedQuestion}
              answerStatus={answerStatus}
              checkMainContent="test"
              setTimeRemaining={setTimeRemaining}
              timeRemaining={durasi}
              onChangePage={onChangePage}
              onClose={() => isMobileView && setIsMobileSidebarOpen(false)}
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
