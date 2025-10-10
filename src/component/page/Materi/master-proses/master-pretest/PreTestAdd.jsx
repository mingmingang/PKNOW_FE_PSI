import { useState, useEffect } from "react";
import Button from "../../../../part/Button copy";
import { object, string } from "yup";
import Input from "../../../../part/Input";
import Loading from "../../../../part/Loading";
import * as XLSX from "xlsx";
import {
  validateAllInputs,
  validateInput,
} from "../../../../util/ValidateForm";
import { API_LINK } from "../../../../util/Constants";
import FileUpload from "../../../../part/FileUpload";
import Swal from "sweetalert2";
import Editor from "../../../../part/CKEditor";
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
import Konfirmasi from "../../../../part/Konfirmasi";
import BackPage from "../../../../../assets/backPage.png";
import Cookies from "js-cookie";
import { decryptId } from "../../../../util/Encryptor";
import CustomStepper from "../../../../part/Stepp";
import UseFetch from "../../../../util/UseFetch";

export default function MasterPreTestAdd({ onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [formContent, setFormContent] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [timer, setTimer] = useState("");
  const [resetStepper, setResetStepper] = useState(0);
  const [isBackAction, setIsBackAction] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);

  const [dataSection, setDataSection] = useState({
    materiId: AppContext_master.dataIDMateri,
    secJudul: "Section Materi " + AppContext_master.dataIDMateri,
    createdby: AppContext_test.activeUser,
    secType: "",
  });

  const uploadFile = async (file) => {
    try {
      const result = await uploadFile(file);
      return result;
    } catch (error) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_LINK}Upload/UploadFile`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer " + Cookies.get("jwtToken"),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    }
  };

  const storedSteps = sessionStorage.getItem("steps");
  const steps = storedSteps ? JSON.parse(storedSteps) : initialSteps;

  const [stepPage, setStepPage] = useState([]);
  const handleAllStepContents = (allSteps) => {
    setStepPage(allSteps);
  };

  const [stepCount, setStepCount] = useState(0);

  const handleStepCountChange = (count) => {
    setStepCount(count);
  };

  const handleGoBack = () => {
    setIsBackAction(true);
    setShowConfirmation(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmation(false);
    window.location.reload();
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };

  const [formData, setFormData] = useState({
    materiId: AppContext_master.dataIDMateri,
    sec_id: AppContext_master.dataIdSection,
    quizId: "",
    quizDeskripsi: AppContext_master?.dataQuizPretest?.quizDeskripsi || "",
    quizTipe: "Pretest",
    tanggalAwal: "",
    tanggalAkhir: "",
    timer: 0,
    status: "Aktif",
    createdby: activeUser,
    type: "Pre-Test",
  });

  useEffect(() => {
    if (typeof AppContext_master.dataIdSectionPretest !== "undefined") {
      setFormContent(AppContext_master.dataPretest);
      setFormData(AppContext_master.dataQuizPretest);
      AppContext_master.dataTimerQuizPreTest;
      setTimer(
        AppContext_master.dataTimerQuizPreTest
          ? convertSecondsToTimeFormat(AppContext_master.dataTimerQuizPreTest)
          : ""
      );
    }
  }, [AppContext_master.dataPretest]);

  const handlePointChange = (e, index) => {
    const { value } = e.target;

    const updatedFormContent = [...formContent];
    updatedFormContent[index].point = value;
    setFormContent(updatedFormContent);

    setFormChoice((prevFormChoice) => ({
      ...prevFormChoice,
      nilaiChoice: value,
    }));
  };

  const addQuestion = (questionType) => {
    const newQuestion = {
      type: questionType,
      jenis: "Tunggal",
      text: `Pertanyaan ${formContent.length + 1}`,
      options: [],
      point: 0,
      correctAnswer: "",
    };
    setFormContent([...formContent, newQuestion]);
    setSelectedOptions([...selectedOptions, ""]);
  };

  const [formQuestion, setFormQuestion] = useState({
    quizId: "",
    soal: "",
    tipeQuestion: "Essay",
    gambar: null,
    status: "Aktif",
    quecreatedby: activeUser,
  });

  formData.timer = timer;

  const [formChoice, setFormChoice] = useState({
    urutanChoice: "",
    isiChoice: "",
    questionId: "",
    nilaiChoice: "",
    quecreatedby: activeUser,
  });

  const userSchema = object({
    materiId: string(),
    sec_id: string(),
    quizId: string(),
    quizJudul: string(),
    quizDeskripsi: string().required("Quiz deskripsi harus diisi"),
    quizTipe: string(),
    tanggalAwal: string(),
    tanggalAkhir: string(),
    timer: string().required("Durasi harus diisi"),
    status: string(),
    createdby: string(),
    type: string(),
  });

  const handleQuestionTypeChange = (e, index) => {
    const updatedFormContent = [...formContent];
    updatedFormContent[index].type = e.target.value;
    setFormContent(updatedFormContent);
  };

  const handleJenisTypeChange = (e, questionIndex) => {
    const { value } = e.target;

    setFormContent((prevFormContent) => {
      const updatedFormContent = [...prevFormContent];
      updatedFormContent[questionIndex].jenis = value;
      updatedFormContent[questionIndex].cho_tipe = value;
      updatedFormContent[questionIndex].options = [];

      setSelectedOptions((prevSelected) => {
        const updatedSelected = [...prevSelected];
        updatedSelected[questionIndex] = value === "Tunggal" ? "" : [];
        return updatedSelected;
      });

      return updatedFormContent;
    });
  };

  const handleAddOption = (index) => {
    const updatedFormContent = [...formContent];
    if (updatedFormContent[index].type === "Pilgan") {
      updatedFormContent[index].options.push({
        label: "",
        value: "",
        point: 0,
      });
      setFormContent(updatedFormContent);
    }
  };

  const handleDeleteOption = (questionIndex, optionIndex) => {
    const updatedFormContent = [...formContent];
    updatedFormContent[questionIndex].options.splice(optionIndex, 1);
    setFormContent(updatedFormContent);
  };

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();

    formData.timer = convertTimeToSeconds(timer);

    if (formData.timer === 0) {
      Swal.fire({
        title: "Gagal!",
        text: "Durasi tidak boleh 0.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const validationErrors = await validateAllInputs(
      formData,
      userSchema,
      setErrors
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Swal.fire({
        title: "Gagal!",
        text: "Pastikan semua data terisi dengan benar!",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const totalQuestionPoint = formContent.reduce((total, question) => {
      if (question.type !== "Pilgan") {
        total += parseInt(question.point);
      }
      return total;
    }, 0);

    const totalOptionPoint = formContent.reduce((total, question) => {
      if (question.type === "Pilgan") {
        return (
          total +
          question.options.reduce(
            (optionTotal, option) => optionTotal + parseInt(option.point || 0),
            0
          )
        );
      }
      return total;
    }, 0);

    if (totalQuestionPoint + totalOptionPoint !== 100) {
      setResetStepper((prev) => !prev + 1);
      Swal.fire({
        title: "Gagal!",
        text: `Total skor harus berjumlah 100. Saat ini skor berjumlah: ${
          totalQuestionPoint + totalOptionPoint
        }`,
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    if (typeof AppContext_master.dataIdSectionPretest === "undefined") {
      try {
        const sectionResponse = await UseFetch(
          API_LINK + "Section/CreateSection",
          dataSection
        );

        if (sectionResponse !== "ERROR" && sectionResponse[0]?.hasil === "OK") {
          const sectionId = sectionResponse[0].newID;
          AppContext_master.dataIdSectionPretest = sectionId;
          formData.timer = convertTimeToSeconds(timer);
          formData.sec_id = sectionId;
          AppContext_master.dataTimerQuizPreTest = formData.timer;

          const quizResponse = await UseFetch(API_LINK + "Quiz/SaveDataQuiz", {
            materiId: AppContext_master.dataIDMateri,
            sec_id: sectionId,
            quizDeskripsi: formData.quizDeskripsi,
            quizTipe: "Pretest",
            tanggalAwal: "",
            tanggalAkhir: "",
            timer: formData.timer,
            status: "Aktif",
            createdby: activeUser,
            type: "Pre-Test",
          });

          if (quizResponse === "ERROR" || quizResponse.length === 0) {
            Swal.fire({
              title: "Gagal!",
              text: "Data yang dimasukkan tidak valid atau kurang",
              icon: "error",
            });
            return;
          }

          const quizId = quizResponse[0].hasil;
          formData.quizId = quizResponse[0].hasil;

          for (const question of formContent) {
            const formQuestion = {
              quizId: quizId,
              soal: question.text,
              tipeQuestion: question.type,
              gambar: question.gambar ?? "",
              status: "Aktif",
              quecreatedby: activeUser,
              point: question.point,
            };

            if (
              (question.type === "Essay" || question.type === "Praktikum") &&
              question.selectedFile
            ) {
              try {
                const uploadResult = await uploadFile(question.selectedFile);
                formQuestion.gambar = uploadResult.Hasil;

                if (question.previewUrl) {
                  URL.revokeObjectURL(question.previewUrl);
                }
              } catch (uploadError) {
                Swal.fire({
                  title: "Gagal!",
                  text: `Gagal mengunggah gambar untuk pertanyaan: ${question.text}`,
                  icon: "error",
                });
                return;
              }
            } else if (question.type === "Pilgan") {
              formQuestion.gambar = "";
            }

            try {
              const questionResponse = await UseFetch(
                API_LINK + "Question/SaveDataQuestion",
                formQuestion
              );

              if (
                questionResponse === "ERROR" ||
                questionResponse.length === 0
              ) {
                Swal.fire({
                  title: "Gagal!",
                  text: "Data yang dimasukkan tidak valid atau kurang",
                  icon: "error",
                });
                return;
              }

              const questionId = questionResponse[0].hasil;

              if (question.type === "Essay" || question.type === "Praktikum") {
                const answerData = {
                  urutanChoice: "",
                  answerText: question.correctAnswer || "0",
                  questionId: questionId,
                  nilaiChoice: question.point,
                  quecreatedby: activeUser,
                };
                const answerResponse = await UseFetch(
                  API_LINK + "Choice/SaveDataChoice",
                  answerData
                );
                if (answerResponse === "ERROR") {
                  Swal.fire({
                    title: "Gagal!",
                    text: "Data yang dimasukkan tidak valid atau kurang",
                    icon: "error",
                  });
                }
              } else if (question.type === "Pilgan") {
                for (const [
                  optionIndex,
                  option,
                ] of question.options.entries()) {
                  const answerData = {
                    urutanChoice: optionIndex + 1,
                    answerText: option.label,
                    questionId: questionId,
                    nilaiChoice: option.point || 0,
                    quecreatedby: activeUser,
                    cho_tipe:
                      question.jenis === "Tunggal" ? "Tunggal" : "Jamak",
                  };

                  const answerResponse = await UseFetch(
                    API_LINK + "Choice/SaveDataChoice",
                    answerData
                  );
                  if (answerResponse === "ERROR") {
                    Swal.fire({
                      title: "Gagal!",
                      text: "Data yang dimasukkan tidak valid atau kurang",
                      icon: "error",
                    });
                  }
                }
              }
              setResetStepper((prev) => !prev + 1);
            } catch (error) {
              Swal.fire({
                title: "Gagal!",
                text: "Data yang dimasukkan tidak valid atau kurang",
                icon: "error",
              });
            }
          }
          Swal.fire({
            title: "Berhasil!",
            text: "Pre Test berhasil ditambahkan",
            icon: "success",
          }).then(() => {
            if (steps.length == 4) {
              window.location.reload();
            } else if (steps.length === 5 && pretest === 3) {
              onChangePage(
                steps[4],
                AppContext_master.MateriForm,
                (AppContext_master.count += 1),
                AppContext_master.dataIdSection,
                AppContext_master.dataSectionSharing,
                AppContext_master.dataIdSectionSharing,
                AppContext_master.dataIdSectionPretest,
                AppContext_master.dataIdSectionPostTest,
                (AppContext_master.dataPretest = formContent),
                (AppContext_master.dataQuizPretest = formData),
                AppContext_master.dataPostTest,
                AppContext_master.dataQuizPostTest,
                AppContext_master.dataTimerQuizPreTest,
                AppContext_master.dataTimerPostTest
              );
            } else if (steps.length === 5 && pretest === 4) {
              window.location.reload();
            } else if (steps.length === 6 && pretest === 3) {
              onChangePage(
                steps[4],
                AppContext_master.MateriForm,
                (AppContext_master.count += 1),
                AppContext_master.dataIdSection,
                AppContext_master.dataSectionSharing,
                AppContext_master.dataIdSectionSharing,
                AppContext_master.dataIdSectionPretest,
                AppContext_master.dataIdSectionPostTest,
                (AppContext_master.dataPretest = formContent),
                (AppContext_master.dataQuizPretest = formData),
                AppContext_master.dataPostTest,
                AppContext_master.dataQuizPostTest,
                AppContext_master.dataTimerQuizPreTest,
                AppContext_master.dataTimerPostTest
              );
            } else if (steps.length === 6 && pretest === 4) {
              onChangePage(
                steps[5],
                AppContext_master.MateriForm,
                (AppContext_master.count += 1),
                AppContext_master.dataIdSection,
                AppContext_master.dataSectionSharing,
                AppContext_master.dataIdSectionSharing,
                AppContext_master.dataIdSectionPretest,
                AppContext_master.dataIdSectionPostTest,
                (AppContext_master.dataPretest = formContent),
                (AppContext_master.dataQuizPretest = formData),
                AppContext_master.dataPostTest,
                AppContext_master.dataQuizPostTest,
                AppContext_master.dataTimerQuizPreTest,
                AppContext_master.dataTimerPostTest
              );
            } else if (steps.length === 6 && pretest === 5) {
              window.location.reload();
            }
          });
        } else {
          Swal.fire({
            title: "Gagal!",
            text: "Terjadi kesalahan saat menyimpan data Section.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Gagal!",
          text: "Terjadi kesalahan saat menyimpan data.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } else {
      formData.timer = convertTimeToSeconds(timer);
      AppContext_master.dataTimerQuizPreTest = formData.timer;
      const quizPayload = {
        quizId: formData.quizId,
        materiId: formData.materiId,
        quizJudul: "",
        quizDeskripsi: formData.quizDeskripsi,
        quizTipe: formData.quizTipe,
        tanggalAwal: formData.tanggalAwal,
        tanggalAkhir: formData.tanggalAkhir,
        timer: formData.timer,
        status: "Aktif",
        modifby: activeUser,
      };

      try {
        const quizResponse = await UseFetch(
          API_LINK + "Quiz/UpdateDataQuiz",
          quizPayload
        );

        if (quizResponse === "ERROR" || !quizResponse.length) {
          Swal.fire({
            title: "Error!",
            text: "Gagal menyimpan quiz.",
            icon: "error",
          });
          return;
        }

        const quizId = quizPayload.quizId;

        await UseFetch(API_LINK + "Question/DeleteQuestionByIdQuiz", {
          p1: quizId,
        });

        for (const question of formContent) {
          const formQuestion = {
            quizId: quizId,
            soal: question.text,
            tipeQuestion: question.type,
            gambar: question.gambar ?? "",
            status: "Aktif",
            quecreatedby: activeUser,
            point: question.point,
          };

          if (
            (question.type === "Essay" || question.type === "Praktikum") &&
            question.selectedFile
          ) {
            try {
              const uploadResult = await uploadFile(question.selectedFile);
              formQuestion.gambar = uploadResult.Hasil;
            } catch (uploadError) {
              Swal.fire({
                title: "Gagal!",
                text: `Gagal mengunggah gambar untuk pertanyaan: ${question.text}`,
                icon: "error",
              });
              return;
            }
          } else if (question.type === "Pilgan") {
            formQuestion.gambar = "";
          }

          try {
            const questionResponse = await UseFetch(
              API_LINK + "Question/SaveDataQuestion",
              formQuestion
            );

            if (questionResponse === "ERROR" || questionResponse.length === 0) {
              Swal.fire({
                title: "Gagal!",
                text: "Data yang dimasukkan tidak valid atau kurang",
                icon: "error",
              });
              return;
            }

            const questionId = questionResponse[0].hasil;

            if (question.type === "Essay" || question.type === "Praktikum") {
              const answerData = {
                urutanChoice: "",
                answerText: question.correctAnswer || "0",
                questionId: questionId,
                nilaiChoice: question.point,
                quecreatedby: activeUser,
              };

              const answerResponse = await UseFetch(
                API_LINK + "Choice/SaveDataChoice",
                answerData
              );
              if (answerResponse === "ERROR") {
                Swal.fire({
                  title: "Gagal!",
                  text: "Data yang dimasukkan tidak valid atau kurang",
                  icon: "error",
                });
              }
            } else if (question.type === "Pilgan") {
              for (const [optionIndex, option] of question.options.entries()) {
                const answerData = {
                  urutanChoice: optionIndex + 1,
                  answerText: option.label,
                  questionId: questionId,
                  nilaiChoice: option.point || 0,
                  quecreatedby: activeUser,
                  cho_tipe: question.jenis === "Tunggal" ? "Tunggal" : "Jamak",
                };
                const answerResponse = await UseFetch(
                  API_LINK + "Choice/SaveDataChoice",
                  answerData
                );
                if (answerResponse === "ERROR") {
                  Swal.fire({
                    title: "Gagal!",
                    text: "Data yang dimasukkan tidak valid atau kurang",
                    icon: "error",
                  });
                }
              }
            }
            setResetStepper((prev) => !prev + 1);
          } catch (error) {
            Swal.fire({
              title: "Gagal!",
              text: "Data yang dimasukkan tidak valid atau kurang",
              icon: "error",
            });
          }
        }
        Swal.fire({
          title: "Berhasil!",
          text: "Pre Test berhasil dimodifikasi",
          icon: "success",
        }).then(() => {
          setFormContent([]);
          setSelectedOptions([]);
          setErrors({});
          setIsButtonDisabled(true);
          if (steps.length == 4) {
            window.location.reload();
          } else if (steps.length === 5 && pretest === 3) {
            onChangePage(
              steps[4],
              AppContext_master.MateriForm,
              (AppContext_master.count += 1),
              AppContext_master.dataIdSection,
              AppContext_master.dataSectionSharing,
              AppContext_master.dataIdSectionSharing,
              AppContext_master.dataIdSectionPretest,
              AppContext_master.dataIdSectionPostTest,
              (AppContext_master.dataPretest = formContent),
              (AppContext_master.dataQuizPretest = formData),
              AppContext_master.dataPostTest,
              AppContext_master.dataQuizPostTest,
              AppContext_master.dataTimerQuizPreTest,
              AppContext_master.dataTimerPostTest
            );
          } else if (steps.length === 5 && pretest === 4) {
            window.location.reload();
          } else if (steps.length === 6 && pretest === 3) {
            onChangePage(
              steps[4],
              AppContext_master.MateriForm,
              (AppContext_master.count += 1),
              AppContext_master.dataIdSection,
              AppContext_master.dataSectionSharing,
              AppContext_master.dataIdSectionSharing,
              AppContext_master.dataIdSectionPretest,
              AppContext_master.dataIdSectionPostTest,
              (AppContext_master.dataPretest = formContent),
              (AppContext_master.dataQuizPretest = formData),
              AppContext_master.dataPostTest,
              AppContext_master.dataQuizPostTest,
              AppContext_master.dataTimerQuizPreTest,
              AppContext_master.dataTimerPostTest
            );
          } else if (steps.length === 6 && pretest === 4) {
            onChangePage(
              steps[5],
              AppContext_master.MateriForm,
              (AppContext_master.count += 1),
              AppContext_master.dataIdSection,
              AppContext_master.dataSectionSharing,
              AppContext_master.dataIdSectionSharing,
              AppContext_master.dataIdSectionPretest,
              AppContext_master.dataIdSectionPostTest,
              (AppContext_master.dataPretest = formContent),
              (AppContext_master.dataQuizPretest = formData),
              AppContext_master.dataPostTest,
              AppContext_master.dataQuizPostTest,
              AppContext_master.dataTimerQuizPreTest,
              AppContext_master.dataTimerPostTest
            );
          } else if (steps.length === 6 && pretest === 5) {
            window.location.reload();
          }
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Terjadi kesalahan saat menyimpan data.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleOptionLabelChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;

    setFormContent((prevFormContent) => {
      const updatedFormContent = [...prevFormContent];
      updatedFormContent[questionIndex].options[optionIndex].label = value;
      return updatedFormContent;
    });
  };

  const handleOptionChange = (e, questionIndex, optionIndex) => {
    const { checked } = e.target;
    const updatedFormContent = [...formContent];
    const question = updatedFormContent[questionIndex];

    if (question.jenis === "Tunggal") {
      question.options.forEach((option, idx) => {
        option.isChecked = idx === optionIndex;
        option.point = idx === optionIndex ? option.point : 0;
      });
    } else if (question.jenis === "Jamak") {
      question.options[optionIndex].isChecked = checked;
      if (!checked) {
        question.options[optionIndex].point = 0;
      }
    }
    setFormContent(updatedFormContent);
  };

  const handleChangeQuestion = (index) => {
    const updatedFormContent = [...formContent];
    const question = updatedFormContent[index];

    if (question.type === "Essay") {
      setCorrectAnswers((prevCorrectAnswers) => ({
        ...prevCorrectAnswers,
        [index]: question.correctAnswer,
      }));
    }

    const newType =
      question.type !== "answer"
        ? question.options.length > 0
          ? "answer"
          : "answer"
        : question.options.length > 0
        ? "Pilgan"
        : "Pilgan";

    updatedFormContent[index] = {
      ...question,
      type: newType,
      options: newType === "Essay" ? [] : question.options,
    };

    setFormContent(updatedFormContent);
  };

  const handleDuplicateQuestion = (index) => {
    const duplicatedQuestion = { ...formContent[index] };
    setFormContent((prevFormContent) => {
      const updatedFormContent = [...prevFormContent];
      updatedFormContent.splice(index + 1, 0, duplicatedQuestion);
      return updatedFormContent;
    });
    setSelectedOptions((prevSelectedOptions) => {
      const updatedSelectedOptions = [...prevSelectedOptions];
      updatedSelectedOptions.splice(index + 1, 0, selectedOptions[index]);
      return updatedSelectedOptions;
    });
  };

  const handleDeleteQuestion = (index) => {
    const updatedFormContent = [...formContent];
    updatedFormContent.splice(index, 1);
    setFormContent(updatedFormContent);
    const updatedSelectedOptions = [...selectedOptions];
    updatedSelectedOptions.splice(index, 1);
    setSelectedOptions(updatedSelectedOptions);
    const updatedCorrectAnswers = { ...correctAnswers };
    delete updatedCorrectAnswers[index];
    setCorrectAnswers(updatedCorrectAnswers);
  };

  const parseExcelData = (data) => {
    const questions = data
      .map((row, index) => {
        if (index < 2) return null;

        const options = row[3] ? row[3].split(",") : [];
        const bobotPilgan = row[4] ? row[4].split(",").map(Number) : [];
        const jenis = row[2]?.toLowerCase();
        const totalNonZero = bobotPilgan.filter((bobot) => bobot !== 0).length;

        return {
          text: row[1],
          type:
            jenis === "pilgan"
              ? "Pilgan"
              : jenis === "essay"
              ? "Essay"
              : "Praktikum",
          jenis:
            jenis === "pilgan"
              ? totalNonZero > 1
                ? "Jamak"
                : "Tunggal"
              : null,
          options:
            jenis === "pilgan"
              ? options.map((option, idx) => ({
                  label: option.trim(),
                  point: bobotPilgan[idx] || 0,
                  isChecked: bobotPilgan[idx] > 0,
                }))
              : [],
          point:
            jenis === "essay" || jenis === "praktikum"
              ? parseInt(row[5] || 0, 10)
              : null,
        };
      })
      .filter(Boolean);

    setFormContent((prevQuestions) => [...prevQuestions, ...questions]);
  };

  const validateTotalPoints = () => {
    const totalPoints = formContent.reduce((total, question) => {
      if (["Essay", "Praktikum"].includes(question.type)) {
        return total + parseInt(question.point || 0, 10);
      } else if (question.type === "Pilgan") {
        return (
          total +
          question.options.reduce(
            (optTotal, opt) => optTotal + parseInt(opt.point || 0, 10),
            0
          )
        );
      }
      return total;
    }, 0);

    return totalPoints;
  };

  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const maxSizeInMB = 10;

    if (!allowedExtensions.includes(fileExtension)) {
      Swal.fire({
        icon: "warning",
        title: "Format Berkas Tidak Valid",
        text: "Hanya file dengan format .jpg, .jpeg, atau .png yang diizinkan.",
      });
      e.target.value = "";
      return;
    }

    if (file.size / 1024 / 1024 > maxSizeInMB) {
      Swal.fire({
        icon: "warning",
        title: "Ukuran File Terlalu Besar",
        text: `Ukuran file maksimal adalah ${maxSizeInMB} MB.`,
      });
      e.target.value = "";
      return;
    }

    Swal.fire({
      title: "Mengunggah file...",
      text: "Mohon tunggu",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const uploadResponse = await uploadFile(file);

      let fileName;
      if (uploadResponse.Hasil) {
        fileName = uploadResponse.Hasil;
      } else if (uploadResponse.filename) {
        fileName = uploadResponse.filename;
      } else if (uploadResponse.data && uploadResponse.data.filename) {
        fileName = uploadResponse.data.filename;
      } else {
        fileName = file.name;
      }

      const updatedFormContent = [...formContent];
      updatedFormContent[index] = {
        ...updatedFormContent[index],
        gambar: fileName,
        previewUrl: URL.createObjectURL(file),
        isNewFile: true,
      };

      setFormContent(updatedFormContent);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "File berhasil diunggah",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Upload Gagal",
        text: `Gagal mengunggah file: ${error.message}`,
        confirmButtonText: "OK",
      });

      e.target.value = "";
    }
  };


  const handleFileExcel = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "warning",
        title: "Format Berkas Tidak Valid",
        text: "Silahkan unggah berkas dengan format: .xls atau .xlsx",
      });
      event.target.value = "";
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadFile = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        parseExcelData(parsedData);
      };
      reader.readAsBinaryString(selectedFile);
      Swal.fire({
        title: "Berhasil!",
        text: "File Excel berhasil ditambahkan",
        icon: "success",
        confirmButtonText: "OK",
      });
    } else {
      Swal.fire({
        title: "Gagal!",
        text: "Pilih file Excel terlebih dahulu!",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template.xlsx";
    link.download = "template.xlsx";
    link.click();
  };

  const updateFormQuestion = (name, value) => {
    setFormQuestion((prevFormQuestion) => ({
      ...prevFormQuestion,
      [name]: value,
    }));
  };

  const handleOptionPointChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;
    const updatedFormContent = [...formContent];

    if (updatedFormContent[questionIndex].options[optionIndex].isChecked) {
      updatedFormContent[questionIndex].options[optionIndex].point = parseInt(
        value,
        10
      );
    }

    setFormContent(updatedFormContent);
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };
  const convertTimeToSeconds = () => {
    return parseInt(hours) * 3600 + parseInt(minutes) * 60;
  };

  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");

  const handleHoursChange = (e) => {
    setHours(e.target.value);
  };

  const handleMinutesChange = (e) => {
    setMinutes(e.target.value);
  };

  const convertSecondsToTimeFormat = (seconds) => {
    const formatHours = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const formatMinutes = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");

    setHours(formatHours);
    setMinutes(formatMinutes);
    return `${formatHours}:${formatMinutes}`;
  };

  const pretest = steps.findIndex((step) => step === "Pre-Test");

  if (isLoading) return <Loading />;
  const initialSteps = ["Pengenalan", "Materi", "Forum"];
  const additionalSteps = ["Sharing Expert", "Pre-Test", "Post-Test"];

  const handleStepAdded = (stepName) => {};

  const handleStepRemoved = (stepName) => {};

  const handleStepChange = (stepContent) => {
    onChangePage(stepContent);
  };

  const handleSebelumnya = () => {
    if (steps.length == 4) {
      onChangePage(
        "forumBefore",
        AppContext_master.Materi,
        AppContext_test.ForumForm,
        (AppContext_master.count += 1),
        (AppContext_master.dataQuizPretest = formData),
        (AppContext_master.dataPretest = formContent),
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataIdSectionPostTest,
        AppContext_master.dataPostTest,
        AppContext_master.dataQuizPostTest,
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    } else if (steps.length == 5 && pretest == 4) {
      onChangePage(
        steps[3],
        AppContext_master.Materi,
        AppContext_test.ForumForm,
        (AppContext_master.count += 1),
        (AppContext_master.dataPretest = formContent),
        (AppContext_master.dataQuizPretest = formData),
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataIdSectionPostTest,
        AppContext_master.dataPostTest,
        AppContext_master.dataQuizPostTest,
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    } else if (steps.length == 5 && pretest == 3) {
      onChangePage(
        "forumBefore",
        AppContext_master.Materi,
        AppContext_test.ForumForm,
        (AppContext_master.count += 1),
        (AppContext_master.dataQuizPretest = formData),
        (AppContext_master.dataPretest = formContent),
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataIdSectionPostTest,
        AppContext_master.dataPostTest,
        AppContext_master.dataQuizPostTest,
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    } else if (steps.length == 6 && pretest == 3) {
      onChangePage(
        "forumBefore",
        AppContext_master.Materi,
        AppContext_test.ForumForm,
        (AppContext_master.count += 1),
        (AppContext_master.dataPretest = formContent),
        (AppContext_master.dataQuizPretest = formData),
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataIdSectionPostTest,
        AppContext_master.dataPostTest,
        AppContext_master.dataQuizPostTest,
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    } else if (steps.length == 6 && pretest == 4) {
      onChangePage(
        steps[3],
        AppContext_master.Materi,
        AppContext_test.ForumForm,
        (AppContext_master.count += 1),
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataIdSectionPostTest,
        (AppContext_master.dataPretest = formContent),
        (AppContext_master.dataQuizPretest = formData),
        AppContext_master.dataPostTest,
        AppContext_master.dataQuizPostTest,
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    } else if (steps.length == 6 && pretest == 5) {
      onChangePage(
        steps[4],
        AppContext_master.Materi,
        AppContext_test.ForumForm,
        (AppContext_master.count += 1),
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataIdSectionPostTest,
        (AppContext_master.dataPostTest = formContent),
        (AppContext_master.dataQuizPostTest = formData),
        AppContext_master.dataPretest,
        AppContext_master.dataQuizPretest,
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    }
  };

  console.log("data nye",
          AppContext_master.dataQuizPretest,);

  return (
    <>
      <style>
        {`
          .form-check input[type="radio"] {
            transform: scale(1.5);
            border-color: #000;
          }
          .file-name {
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis; 
            max-width: 100%;
          }
          .option-input {
            background: transparent;
            border: none;
            outline: none;
            border-bottom: 1px solid #000;
            margin-left: 20px;
          }
          .form-check {
            margin-bottom: 8px;
          }
          .question-input {
            margin-bottom: 12px;
          }
          .file-upload-label {
            font-size: 14px;
          }
          .file-ket-label {
            font-size: 10px;
          }
        `}
      </style>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "100px",
          marginLeft: "70px",
          marginRight: "70px",
        }}
      >
        <div className="back-and-title" style={{ display: "flex" }}>
          <button
            style={{ backgroundColor: "transparent", border: "none" }}
            onClick={handleGoBack}
          >
            <img src={BackPage} alt="" />
          </button>
          <h4
            style={{
              color: "#0A5EA8",
              fontWeight: "bold",
              fontSize: "30px",
              marginTop: "10px",
              marginLeft: "20px",
            }}
          >
            Tambah Pre-Test
          </h4>
        </div>
        <div className="ket-draft">
          <span className="badge text-bg-dark " style={{ fontSize: "16px" }}>
            Draft
          </span>
        </div>
      </div>
      <form id="myForm" onSubmit={handleAdd}>
        <div style={{ margin: "20px 100px" }}>
          <CustomStepper
            initialSteps={initialSteps}
            additionalSteps={additionalSteps}
            onChangeStep={pretest}
            onStepAdded={handleStepAdded}
            onStepRemoved={handleStepRemoved}
            onChangePage={handleStepChange}
            onStepCountChanged={handleStepCountChange}
            onAllStepContents={handleAllStepContents}
          />
        </div>
        <div className="card mt-4" style={{ margin: "100px" }}>
          <div className="card-body p-4">
            <div className="row mb-3">
              <div className="col-lg-7">
                <Input
                  type="text"
                  label="Deskripsi"
                  forInput="quizDeskripsi"
                  value={formData.quizDeskripsi}
                  onChange={handleInputChange}
                  isRequired={true}
                  style={{ width: "100%" }}
                  errorMessage={errors.quizDeskripsi}
                />
              </div>
              <div className="col-lg-4">
                <label htmlFor="waktuInput" className="form-label">
                  <span style={{ fontWeight: "bold" }}>Durasi:</span>
                  <span style={{ color: "red" }}> *</span>
                </label>

                <div className="d-flex">
                  <div className="d-flex align-items-center me-3">
                    <select
                      className="form-select me-2"
                      name="hours"
                      value={hours}
                      onChange={handleHoursChange}
                    >
                      {[...Array(24)].map((_, i) => (
                        <option key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    <span>Jam</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <select
                      className="form-select me-2"
                      name="minutes"
                      value={minutes}
                      onChange={handleMinutesChange}
                    >
                      {[...Array(60)].map((_, i) => (
                        <option key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    <span>Menit</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mb-4">
              <div className="mb-2"></div>
              <div className="d-flex justify-content-between">
                <div className="d-flex">
                  <div className="">
                    <Button
                      title="Tambah Pertanyaan"
                      onClick={() => addQuestion("Essay")}
                      iconName="plus"
                      label="Tambah Soal"
                      classType="primary btn-sm px-3 py-2 rounded-3 fw-semibold"
                    />
                    <input
                      type="file"
                      id="fileInput"
                      style={{ display: "none" }}
                      onChange={handleFileExcel}
                      accept=".xls, .xlsx"
                    />
                  </div>
                  <div className="ml-3">
                    <Button
                      title="Tambah File Excel"
                      iconName="upload"
                      label="Tambah File Excel"
                      classType="primary btn-sm mx-2 px-3 py-2 rounded-3 fw-semibold"
                      onClick={() =>
                        document.getElementById("fileInput").click()
                      }
                    />
                  </div>
                </div>
                {selectedFile && <span>{selectedFile.name}</span>}
                <br></br>
                <br></br>
                <div className="d-flex ">
                  <div className="mr-4">
                    <Button
                      title="Unggah File Excel"
                      iconName="paper-plane"
                      classType="primary btn-sm px-3 py-2 rounded-3 fw-semibold"
                      onClick={handleUploadFile}
                      label="Unggah File"
                    />
                  </div>
                  <div className="">
                    <Button
                      iconName="download"
                      label="Unduh Template"
                      classType="warning btn-sm px-3 py-2 mx-2 rounded-3 fw-semibold"
                      onClick={handleDownloadTemplate}
                      title="Unduh Template Excel"
                    />
                  </div>
                </div>
              </div>
            </div>
            {formContent.map((question, index) => (
              <div key={index} className="card mb-4">
                <div className="card-header bg-white fw-medium text-black d-flex justify-content-between align-items-center">
                  <span>Pertanyaan</span>
                  <span>
                    Skor:{" "}
                    {question.type === "Pilgan"
                      ? (question.options || []).reduce(
                          (acc, option) => acc + parseInt(option.point),
                          0
                        )
                      : parseInt(question.point)}
                  </span>

                  <div className="col-lg-2">
                    <select
                      className="form-select"
                      aria-label="Default select example"
                      value={question.type}
                      onChange={(e) => handleQuestionTypeChange(e, index)}
                    >
                      <option value="Essay">Essay</option>
                      <option value="Pilgan">Pilihan Ganda</option>
                      <option value="Praktikum">Praktikum</option>
                    </select>
                  </div>
                </div>
                <div className="card-body p-4">
                  {question.type === "answer" ? (
                    <div className="row">
                      <div className="col-lg-12 question-input">
                        <Input
                          type="text"
                          label={`Question ${index + 1}`}
                          forInput={`questionText-${index}`}
                          value={question.text}
                          onChange={(e) => {
                            const updatedFormContent = [...formContent];
                            updatedFormContent[index].text = e.target.value;
                            setFormContent(updatedFormContent);
                            updateFormQuestion("soal", e.target.value);
                          }}
                          isRequired={true}
                        />
                      </div>

                      <div className="col-lg-12">
                        <div className="form-check">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex}>
                              <input
                                type="radio"
                                id={`option_${index}_${optionIndex}`}
                                name={`option_${index}`}
                                value={option.value}
                                checked={
                                  selectedOptions[index] === option.value
                                }
                                onChange={(e) => handleOptionChange(e, index)}
                                style={{ marginRight: "5px" }}
                              />
                              <label htmlFor={`option_${index}_${optionIndex}`}>
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>

                        <Input
                          type="number"
                          label="Point"
                          value={question.point}
                          onChange={(e) => handlePointChange(e, index)}
                        />
                        <Button
                          classType="primary btn-sm ms-2 px-3 py-1"
                          label="Done"
                          onClick={() => handleChangeQuestion(index)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="row">
                      <div className="col-lg-12 question-input">
                        <label
                          htmlFor="deskripsiMateri"
                          className="form-label fw-bold"
                        >
                          Pertanyaan <span style={{ color: "Red" }}> *</span>
                        </label>
                        <Editor
                          id={`pertanyaan_${index}`}
                          value={question.text}
                          onChange={(content) => {
                            const updatedFormContent = [...formContent];
                            updatedFormContent[index].text = content;
                            setFormContent(updatedFormContent);
                            setFormQuestion((prevFormQuestion) => ({
                              ...prevFormQuestion,
                              soal: content,
                            }));
                          }}
                          disabled={isFormDisabled}
                        />
                      </div>

                        {(question.type === "Essay" ||
                          question.type === "Praktikum") && (
                          <div className="col-lg-12 d-flex align-items-center form-check">
                            <div className="d-flex flex-column w-100">
                              <FileUpload
                                forInput={`fileInput_${index}`}
                                formatFile=".jpg,.jpeg,.png"
                                label={
                                  <span className="file-upload-label">
                                    Gambar (.jpg, .jpeg, .png)
                                  </span>
                                }
                                onChange={(e) => handleFileChange(e, index)}
                                hasExisting={formContent[index]?.img || null}
                                style={{ fontSize: "12px" }}
                              />

                              {question.previewUrl && (
                                <div
                                  style={{
                                    maxWidth: "300px",
                                    maxHeight: "300px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <img
                                    src={question.previewUrl}
                                    alt="Preview"
                                    style={{
                                      width: "100%",
                                      height: "auto",
                                      objectFit: "contain",
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                </div>
                              )}
                              {!question.previewUrl && question.gambar && (
                                <div
                                  style={{
                                    marginTop: "10px",
                                    padding: "10px",
                                    backgroundColor: "#f8f9fa",
                                    borderRadius: "4px",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: "12px",
                                      color: "#666",
                                      margin: 0,
                                    }}
                                  >
                                    File gambar: {question.gambar}
                                  </p>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary mt-2"
                                    onClick={() => {
                                      const updatedFormContent = [
                                        ...formContent,
                                      ];
                                      updatedFormContent[
                                        index
                                      ].previewUrl = `${API_LINK}Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                                        question.gambar
                                      )}`;
                                      setFormContent(updatedFormContent);
                                    }}
                                  >
                                    Muat Gambar
                                  </button>
                                </div>
                              )}

                              {question.gambar && !question.selectedFile && (
                                <div
                                  style={{
                                    maxWidth: "300px",
                                    maxHeight: "300px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <img
                                    src={question.gambar}
                                    alt=""
                                    style={{
                                      width: "100%",
                                      height: "auto",
                                      objectFit: "contain",
                                    }}
                                  />
                                </div>
                              )}

                              <div className="mt-2">
                                <label className="form-label fw-bold">
                                  Point <span style={{ color: "Red" }}> *</span>
                                </label>{" "}
                                <Input
                                  type="number"
                                  value={question.point}
                                  onChange={(e) => handlePointChange(e, index)}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                      {question.type === "Pilgan" && (
                        <>
                          <div
                            className="col-lg-2 mb-3"
                            style={{ width: "250px" }}
                          >
                            <select
                              className="form-select"
                              aria-label="Default select example"
                              value={question.jenis}
                              onChange={(e) => handleJenisTypeChange(e, index)}
                            >
                              <option value="Tunggal">Pilihan Tunggal</option>
                              <option value="Jamak">Pilihan Jamak</option>
                            </select>
                          </div>

                          <div className="col-lg-12">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="form-check"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: "10px",
                                  marginLeft: "-15px",
                                }}
                              >
                                <input
                                  type={
                                    question.jenis === "Tunggal"
                                      ? "radio"
                                      : "checkbox"
                                  }
                                  id={`option_${index}_${optionIndex}`}
                                  name={`option_${index}`}
                                  value={option.value}
                                  checked={!!option.isChecked}
                                  onChange={(e) =>
                                    handleOptionChange(e, index, optionIndex)
                                  }
                                  style={{ marginRight: "10px" }}
                                />

                                <input
                                  type="text"
                                  value={option.label}
                                  onChange={(e) =>
                                    handleOptionLabelChange(
                                      e,
                                      index,
                                      optionIndex
                                    )
                                  }
                                  readOnly={question.type === "answer"}
                                  style={{
                                    marginRight: "10px",
                                    padding: "5px",
                                    borderRadius: "10px",
                                    border: "1px solid grey",
                                  }}
                                />
                                <Button
                                  iconName="delete"
                                  classType="btn-sm ms-2 px-2 py-1"
                                  onClick={() =>
                                    handleDeleteOption(index, optionIndex)
                                  }
                                  style={{
                                    marginRight: "10px",
                                    backgroundColor: "red",
                                    color: "white",
                                  }}
                                />
                                {option.isChecked && (
                                  <input
                                    type="text"
                                    id={`optionPoint_${index}_${optionIndex}`}
                                    value={option.point}
                                    className="btn-sm ms-2 px-2 py-0"
                                    onChange={(e) =>
                                      handleOptionPointChange(
                                        e,
                                        index,
                                        optionIndex
                                      )
                                    }
                                    style={{ width: "50px" }}
                                  />
                                )}
                              </div>
                            ))}

                            <Button
                              onClick={() => handleAddOption(index)}
                              iconName="add"
                              classType="success btn-sm px-3 py-2 mt-2 rounded-3"
                              label="Opsi Baru"
                            />
                          </div>
                        </>
                      )}

                      <div className="d-flex justify-content-between my-2 mx-1">
                        <div></div>
                        <div className="d-flex">
                          <div className="mr-3">
                            <Button
                              iconName="trash"
                              label="Hapus"
                              classType="btn-sm ms-2 px-3 py-2 fw-semibold rounded-3"
                              style={{ backgroundColor: "red", color: "white" }}
                              onClick={() => handleDeleteQuestion(index)}
                            />
                          </div>
                          <div className="mr-4">
                            <Button
                              iconName="duplicate"
                              label="Duplikat"
                              classType="primary btn-sm ms-2 px-3 py-2 fw-semibold rounded-3 "
                              onClick={() => handleDuplicateQuestion(index)}
                            />
                          </div>
                          <div className="">
                            <Button
                              title="Tambah Pertanyaan"
                              onClick={() => addQuestion("Essay")}
                              iconName="plus"
                              label="Tambah Soal"
                              classType="primary btn-sm px-3 py-2 fw-semibold rounded-3"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-between my-4 mx-1 mt-0">
            <div className="ml-4">
              <Button
                classType="outline-secondary me-2 px-4 py-2"
                label="Sebelumnya"
                onClick={handleSebelumnya}
              />
            </div>
            <div className="d-flex mr-4">
              <div className="mr-2">
                <Button
                  classType="primary ms-2 px-4 py-2"
                  type="submit"
                  label={
                    (steps.length === 4 && pretest === 3) ||
                    (steps.length === 5 && pretest === 4) ||
                    (steps.length === 6 && pretest === 5)
                      ? "Simpan"
                      : "Berikutnya"
                  }
                  disabled={isButtonDisabled}
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="total-score-container">
        Total Skor: {validateTotalPoints()}
      </div>
      {showConfirmation && (
        <Konfirmasi
          title={isBackAction ? "Konfirmasi Kembali" : "Konfirmasi Simpan"}
          pesan={
            isBackAction
              ? "Apakah anda ingin kembali?"
              : "Anda yakin ingin simpan data?"
          }
          onYes={handleConfirmYes}
          onNo={handleConfirmNo}
        />
      )}
    </>
  );
}
