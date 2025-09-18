import { useState, useEffect } from "react";
import Button from "../../../../part/Button copy";
import { object, string } from "yup";
import Input from "../../../../part/Input";
import * as XLSX from "xlsx";
import { validateInput } from "../../../../util/ValidateForm";
import { API_LINK } from "../../../../util/Constants";
import FileUpload from "../../../../part/FileUpload";
import Editor from "../../../../part/CKEditor";
import Swal from "sweetalert2";
import AppContext_master from "../../master-test/TestContext";
import AppContext_test from "../../master-test/TestContext";
import Alert from "../../../../part/Alert";
import Cookies from "js-cookie";
import { decryptId } from "../../../../util/Encryptor";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import BackPage from "../../../../../assets/backPage.png";
import Konfirmasi from "../../../../part/Konfirmasi";
import { decode } from "he";
import UseFetch from "../../../../util/UseFetch";

const steps = [
  "Pengenalan",
  "Materi",
  "Forum",
  "Sharing Expert",
  "Pre Test",
  "Post Test",
];

function getStepContent(stepIndex) {
  switch (stepIndex) {
    case 0:
      return "pengenalanEdit";
    case 1:
      return "materiEdit";
    case 2:
      return "forumEdit";
    case 3:
      return "sharingEdit";
    case 4:
      return "pretestEdit";
    case 5:
      return "posttestEdit";
    default:
      return "Unknown stepIndex";
  }
}

function CustomStepper({ activeStep, steps, onChangePage, getStepContent }) {
  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step
            key={label}
            onClick={() => onChangePage(getStepContent(index))}
            sx={{
              cursor: "pointer",
              "& .MuiStepIcon-root": {
                fontSize: "1.5rem",
                color: index <= activeStep ? "primary.main" : "grey.300",
                "&.Mui-active": {
                  color: "primary.main",
                },
                "& .MuiStepIcon-text": {
                  fill: "#fff",
                  fontSize: "1rem",
                },
              },
            }}
          >
            <StepLabel
              sx={{
                "& .MuiStepLabel-label": {
                  typography: "body1",
                  color: index <= activeStep ? "primary.main" : "grey.500",
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

export default function MasterPostTestEdit({ onChangePage, withID }) {
  const [formContent, setFormContent] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [timer, setTimer] = useState("");
  const [deletedChoices, setDeletedChoices] = useState([]);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [formData, setFormData] = useState({
    quizId: "",
    materiId: "",
    quizJudul: "",
    quizDeskripsi: "",
    quizTipe: "Posttest",
    tanggalAwal: "",
    tanggalAkhir: "",
    timer: "",
    status: "Aktif",
    modifby: activeUser,
  });

  const [formQuestion, setFormQuestion] = useState({
    quizId: "",
    soal: "",
    tipeQuestion: "Essay",
    gambar: "",
    questionDeskripsi: "",
    status: "Aktif",
    quemodifby: activeUser,
  });

  const [formChoice, setFormChoice] = useState({
    urutanChoice: "",
    isiChoice: "",
    questionId: "",
    nilaiChoice: "",
    quemodifby: activeUser,
  });

  const userSchema = object({
    quizId: string(),
    materiId: string(),
    quizJudul: string(),
    quizDeskripsi: string().required("Quiz deskripsi harus diisi"),
    quizTipe: string(),
    tanggalAwal: string().required("Tanggal awal harus diisi"),
    tanggalAkhir: string().required("Tanggal akhir harus diisi"),
    timer: string().required("Durasi harus diisi"),
    status: string(),
    modifby: string(),
  });

  const handleJenisTypeChange = (e, questionIndex) => {
    const { value } = e.target;

    setFormContent((prevFormContent) => {
      const updatedFormContent = [...prevFormContent];
      const question = updatedFormContent[questionIndex];

      question.jenis = value;

      let choicesToDelete = [];
      if (value === "Jamak") {
        choicesToDelete = question.options
          .filter((option) => !option.isChecked && option.id)
          .map((option) => option.id);

        question.options = question.options.filter(
          (option) => option.isChecked
        );
        question.options.forEach((option) => {
          option.isChecked = false;
        });
      } else if (value === "Tunggal") {
        const firstCheckedOption = question.options.find(
          (option) => option.isChecked
        );

        choicesToDelete = question.options
          .filter((option) => option.id && option !== firstCheckedOption)
          .map((option) => option.id);

        question.options = firstCheckedOption
          ? [firstCheckedOption]
          : question.options.slice(0, 1);
        question.options.forEach((option, idx) => {
          option.isChecked = idx === 0;
        });
      }

      setDeletedChoices((prev) => [...prev, ...choicesToDelete]);

      return updatedFormContent;
    });
  };

  const Materi = AppContext_master.DetailMateriEdit;
  const hasTest = Materi.Posttest !== null && Materi.Posttest !== "";

  async function fetchSectionAndQuizData() {
    setIsLoading(true);
    setIsError({ error: false, message: "" });

    try {
      const sectionData = await UseFetch(
        API_LINK + "Section/GetDataSectionByMateri",
        {
          p1: Materi.Key,
          p2: "Post-Test",
          p3: "Aktif",
        }
      );

      if (sectionData === "ERROR" || sectionData.length === 0) {
        throw new Error("Data Section untuk Post-Test tidak dapat ditemukan.");
      }

      const sectionId = sectionData[0].SectionId;

      const quizData = await UseFetch(
        API_LINK + "Quiz/GetDataQuizByIdSection",
        {
          secId: sectionId,
        }
      );

      if (quizData === "ERROR" || quizData.length === 0) {
        throw new Error("Data Quiz untuk Post-Test tidak dapat ditemukan.");
      }

      const convertedData = {
        ...quizData[0],
        tanggalAwal: quizData[0]?.tanggalAwal
          ? new Date(quizData[0].tanggalAwal).toISOString().split("T")[0]
          : "",
        tanggalAkhir: quizData[0]?.tanggalAkhir
          ? new Date(quizData[0].tanggalAkhir).toISOString().split("T")[0]
          : "",
      };

      setTimer(
        quizData[0]?.timer ? convertSecondsToTimeFormat(quizData[0].timer) : ""
      );
      setFormData(convertedData);
    } catch (error) {
      setIsError({
        error: true,
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    fetchSectionAndQuizData();
  }, []);

  const getDataQuestion = async () => {
    setIsLoading(true);

    try {
      while (true) {
        const responseData = await UseFetch(API_LINK + "Quiz/GetDataQuestion", {
          quiId: formData.quizId,
        });

        if (responseData === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data pertanyaan quiz."
          );
        } else if (responseData.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          const formattedQuestions = {};
          const filePromises = [];

          responseData.forEach((question) => {
            if (question.Key in formattedQuestions) {
              if (question.TipeSoal === "Pilgan") {
                formattedQuestions[question.Key].options.push({
                  id: question.JawabanId,
                  label: question.Jawaban,
                  point: question.NilaiJawabanOpsi,
                  key: question.Key,
                  jenis: question.TipePilihan,
                  isChecked: !!question.NilaiJawabanOpsi,
                });
              }
            } else {
              formattedQuestions[question.Key] = {
                type: question.TipeSoal,
                text: decode(question.Soal),
                options: [],
                jenis: question.TipePilihan,
                gambar: question.Gambar || "",
                img: question.Gambar || "",
                point: question.NilaiJawaban,
                key: question.Key,
                correctAnswer:
                  question.TipeSoal === "Essay"
                    ? question.JawabanBenar || ""
                    : null,
              };

              if (question.TipeSoal === "Pilgan" && question.JawabanId) {
                formattedQuestions[question.Key].options.push({
                  id: question.JawabanId,
                  label: question.Jawaban,
                  point: question.NilaiJawabanOpsi,
                  key: question.Key,
                  jenis: question.TipePilihan,
                  isChecked: !!question.NilaiJawabanOpsi,
                });
              }
            }

            if (question.Gambar) {
              formattedQuestions[question.Key].previewUrl = `${API_LINK}Upload/DownloadFile?namaFile=${encodeURIComponent(
                question.Gambar
              )}`;

              const gambarPromise = UseFetch(
                `${API_LINK}Utilities/DownloadFile`,
                { namaFile: question.Gambar },
                "GET",
                "blob"
              )
                .then((response) => {
                  if (response !== "ERROR" && response.blob) {
                    const url = URL.createObjectURL(response.blob);
                    formattedQuestions[question.Key].gambar = url;
                  }
                })
                .catch((error) => {
                  console.error("Error saat mengambil gambar:", error);
                });

              filePromises.push(gambarPromise);
            }
          });

          Object.values(formattedQuestions).forEach((q) => {
            if (q.type === "Pilgan" && q.options.length > 0) {
              q.options.sort((a, b) => a.urutan - b.urutan);
            }
          });

          await Promise.all(filePromises);
          const formattedQuestionsArray = Object.values(formattedQuestions);
          setFormContent(formattedQuestionsArray);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  useEffect(() => {
    if (formData.quizId) getDataQuestion();
  }, [formData.quizId]);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);

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

  const handleOptionPointChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;
    const pointValue = parseInt(value, 10) || 0;

    const updatedFormContent = formContent.map((question, qIndex) => {
      if (qIndex === questionIndex) {
        const updatedOptions = question.options.map((option, oIndex) => {
          if (oIndex === optionIndex) {
            return {
              ...option,
              point: pointValue,
            };
          }
          return option;
        });

        const totalPoints = updatedOptions.reduce(
          (acc, opt) => acc + opt.point,
          0
        );

        return {
          ...question,
          options: updatedOptions,
          point: totalPoints,
        };
      }
      return question;
    });

    setFormContent(updatedFormContent);
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

  const addQuestion = (questionType) => {
    const newQuestion = {
      type: questionType,
      text: `Pertanyaan ${formContent.length + 1}`,
      options: [],
      point: 0,
      correctAnswer: "",
    };
    setFormContent([...formContent, newQuestion]);
    setSelectedOptions([...selectedOptions, ""]);
  };

  const handleQuestionTypeChange = async (e, index) => {
    const newType = e.target.value;
    const questionId = formContent[index].key;

    const originalFormContent = [...formContent];
    const updatedFormContent = [...formContent];
    const questionToUpdate = { ...updatedFormContent[index] };

    questionToUpdate.type = newType;
    if (newType === "Pilgan") {
      questionToUpdate.jenis = "Tunggal";
      questionToUpdate.options = [];
    }
    updatedFormContent[index] = questionToUpdate;
    setFormContent(updatedFormContent);

    try {
      const response = await UseFetch(API_LINK + "Question/SetTypeQuestion", {
        p1: questionId,
        p2: newType,
      });

      if (response === "ERROR") {
        throw new Error("Gagal memperbarui tipe soal di server.");
      }
    } catch (error) {
      Swal.fire(
        "Error",
        "Gagal menyimpan perubahan. Mengembalikan ke keadaan semula.",
        "error"
      );

      setFormContent(originalFormContent);
    }
  };

  const handleAddOption = (index) => {
    const updatedFormContent = [...formContent];
    const question = updatedFormContent[index];

    const newOption = {
      id: null,
      label: "",
      value: "",
      point: 0,
      isChecked: false,
    };

    question.options.push(newOption);
    setFormContent(updatedFormContent);
  };

  const handleOptionLabelChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;
    const updatedFormContent = [...formContent];
    updatedFormContent[questionIndex].options[optionIndex].label = value;
    setFormContent(updatedFormContent);
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

  const handleDuplicateQuestion = (index) => {
    const questionToDuplicate = { ...formContent[index] };
    const duplicatedQuestion = {
      ...questionToDuplicate,
      key: null,
      options: questionToDuplicate.options.map((option) => ({
        ...option,
        id: null,
      })),
    };

    setFormContent((prevFormContent) => {
      const updatedFormContent = [...prevFormContent];
      updatedFormContent.splice(index + 1, 0, duplicatedQuestion);
      return updatedFormContent;
    });

    setSelectedOptions((prevSelectedOptions) => {
      const updatedSelectedOptions = [...prevSelectedOptions];
      updatedSelectedOptions.splice(index + 1, 0, "");
      return updatedSelectedOptions;
    });
  };

  const handleDeleteOption = (questionIndex, optionIndex) => {
    const updatedFormContent = [...formContent];
    const deletedOption =
      updatedFormContent[questionIndex].options[optionIndex];

    if (deletedOption.id) {
      setDeletedChoices((prev) => [...prev, deletedOption.id]);
    }

    updatedFormContent[questionIndex].options.splice(optionIndex, 1);
    setFormContent(updatedFormContent);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleDeleteQuestion = (index) => {
    const question = formContent[index];
    const questionId = question.key;

    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Pertanyaan ini akan dihapus permanen setelah Anda menyimpan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (question.type === "Pilgan" && question.options) {
            const deletePromises = question.options
              .filter((choice) => choice.id)
              .map((choice) => deleteChoiceAPI(choice.id));

            const results = await Promise.all(deletePromises);

            if (results.some((res) => res === "ERROR")) {
              throw new Error(
                "Gagal menghapus salah satu pilihan dari pertanyaan."
              );
            }
          }

          const responseData = await UseFetch(
            API_LINK + "Question/DeleteQuestion",
            {
              p1: questionId,
            }
          );

          if (responseData === "ERROR") {
            throw new Error(
              "Terjadi kesalahan pada server saat menghapus pertanyaan."
            );
          }

          if (responseData === null) {
            Swal.fire({
              title: "Gagal Dihapus!",
              text: "Pertanyaan tidak dapat dihapus karena telah dijawab pada pengerjaan post-test.",
              icon: "error",
              confirmButtonText: "OK",
            });
            return;
          }

          const updatedFormContent = formContent.filter((_, i) => i !== index);
          setFormContent(updatedFormContent);

          Swal.fire(
            "Dihapus!",
            "Pertanyaan telah dihapus sementara.",
            "success"
          );
        } catch (error) {
          Swal.fire({
            title: "Gagal!",
            text:
              error.message || "Terjadi kesalahan saat menghapus pertanyaan.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  const deleteChoiceAPI = async (choiceId) => {
    try {
      const response = await UseFetch(API_LINK + "Choice/DeleteChoice", {
        p1: choiceId,
      });

      return response;
    } catch (error) {
      return "ERROR";
    }
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
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    }
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
      return;
    }

    if (file.size / 1024 / 1024 > maxSizeInMB) {
      Swal.fire({
        icon: "warning",
        title: "Ukuran File Terlalu Besar",
        text: `Ukuran file maksimal adalah ${maxSizeInMB} MB.`,
      });
      return;
    }

    try {
      const uploadResponse = await uploadFile(file);
      const fileName = uploadResponse.Hasil;

      const updatedFormContent = [...formContent];
      updatedFormContent[index] = {
        ...updatedFormContent[index],
        gambar: fileName,
        previewUrl: URL.createObjectURL(file),
      };
      setFormContent(updatedFormContent);
    } catch (error) {}
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
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
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

      const totalPoints = validateTotalPoints();
      if (totalPoints !== 100) {
        Swal.fire({
          title: "Error!",
          text: `Total poin untuk semua pertanyaan harus 100. Saat ini: ${totalPoints}`,
          icon: "error",
          confirmButtonText: "OK",
        });
        setIsSaving(false);
        return;
      }

      const quizPayload = {
        quizId: formData.quizId,
        materiId: formData.materiId,
        quizJudul: formData.quizJudul,
        quizDeskripsi: formData.quizDeskripsi,
        quizTipe: formData.quizTipe,
        tanggalAwal: formData.tanggalAwal,
        tanggalAkhir: formData.tanggalAkhir,
        timer: formData.timer,
        status: "Aktif",
        modifby: activeUser,
      };

      const quizResponse = await UseFetch(
        API_LINK + "Quiz/UpdateDataQuiz",
        quizPayload
      );

      if (!quizResponse.length) {
        Swal.fire({
          title: "Error!",
          text: "Gagal menyimpan quiz.",
          icon: "error",
          confirmButtonText: "OK",
        });
        setIsSaving(false);
        return;
      }

      for (const choiceId of deletedChoices) {
        try {
          await deleteChoiceAPI(choiceId);
        } catch (error) {}
      }

      for (const question of formContent) {
        let payload;

        const isBlobUrl = question.gambar?.startsWith("blob:") || false;
        const finalGambar = isBlobUrl ? question.img : question.gambar;
        if (!question.key) {
          payload = {
            p1: formData.quizId,
            p2: question.text,
            p3: question.type,
            p4: finalGambar || "",
            p5: "Aktif",
            p6: activeUser,
            p7: question.point || 0,
          };

          const response = await UseFetch(
            API_LINK + "Question/SaveDataQuestion",
            payload
          );
          const newQuestionId = response[0]?.hasil;

          if (!newQuestionId) throw new Error("Failed to save question.");
          question.key = newQuestionId;
        } else {
          const updatePayload = {
            p1: question.key,
            p2: formData.quizId,
            p3: question.text,
            p4: question.type,
            p5: finalGambar || "",
            p6: "Aktif",
            p7: activeUser,
            p8: question.point || 0,
          };
          const updateResponse = await UseFetch(
            API_LINK + "Question/UpdateDataQuestion",
            updatePayload
          );
          if (updateResponse === "ERROR") {
            throw new Error(`Gagal memperbarui pertanyaan: "${question.text}"`);
          }
        }

        if (question.type === "Pilgan") {
          for (const [optionIndex, option] of question.options.entries()) {
            if (!option.id) {
              const createOptionPayload = {
                p1: optionIndex + 1,
                p2: option.label,
                p3: question.key,
                p4: option.point || 0,
                p5: activeUser,
                p6: question.jenis === "Tunggal" ? "Tunggal" : "Jamak",
              };
              const optionResponse = await UseFetch(
                API_LINK + "Choice/SaveDataChoice",
                createOptionPayload
              );
              const newOptionId = optionResponse?.[0]?.hasil;
              if (optionResponse === "ERROR" || !newOptionId) {
                throw new Error(
                  `Gagal menyimpan pilihan baru: "${option.label}"`
                );
              }
              option.id = newOptionId;
            } else {
              const updateOptionPayload = {
                cho_id: option.id,
                questionId: question.key,
                urutanChoice: optionIndex + 1,
                cho_isi: option.label,
                cho_nilai: option.point || 0,
                quemodifby: activeUser,
                cho_tipe: question.jenis === "Tunggal" ? "Tunggal" : "Jamak",
              };
              const updateOptionResponse = await UseFetch(
                API_LINK + "Choice/UpdateDataChoice",
                updateOptionPayload
              );
              if (updateOptionResponse === "ERROR") {
                throw new Error(`Gagal memperbarui pilihan: "${option.label}"`);
              }
            }
          }
        }
      }

      setDeletedChoices([]);

      Swal.fire({
        title: "Berhasil!",
        text: "Data berhasil disimpan.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      Swal.fire({
        title: "Gagal!",
        text: error.message || "Terjadi kesalahan saat menyimpan data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const updatedFormContent = formContent.map((question) => {
      if (question.gambar && !question.previewUrl) {
        return {
          ...question,
          previewUrl: `${API_LINK}Upload/GetFile/${question.gambar}`,
        };
      }
      return question;
    });
    setFormContent(updatedFormContent);
  }, []);

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template.xlsx";
    link.download = "template.xlsx";
    link.click();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);

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

  const removeHtmlTags = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const handlePageChange = (content) => {
    onChangePage(content);
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
            Edit Post-Test
          </h4>
        </div>
      </div>
      <form id="myForm" onSubmit={handleAdd}>
        <div>
          <CustomStepper
            activeStep={5}
            steps={steps}
            onChangePage={handlePageChange}
            getStepContent={getStepContent}
          />
        </div>

        <div className="card mt-3 mb-3" style={{ margin: "0 80px" }}>
          <div className="card-body p-4">
            {hasTest ? (
              <div>
                <div className="row mb-4">
                  <div className="col-lg-7">
                    <Input
                      type="text"
                      label="Deskripsi Quiz"
                      forInput="quizDeskripsi"
                      value={
                        formData && formData.quizDeskripsi
                          ? decode(formData.quizDeskripsi)
                          : "Deskripsi tidak tersedia"
                      }
                      onChange={handleInputChange}
                      isRequired={true}
                    />
                  </div>
                  <div className="col-lg-4">
                    <label htmlFor="waktuInput" className="form-label">
                      <span style={{ fontWeight: "bold" }}>Durasi:</span>
                      <span style={{ color: "red" }}> *</span>
                    </label>

                    <div className="d-flex align-items-center">
                      <div className="d-flex align-items-center me-3">
                        <select
                          className="form-select me-2"
                          name="hours"
                          value={hours}
                          onChange={handleHoursChange}
                        >
                          {[...Array(24)].map((_, i) => (
                            <option
                              key={i}
                              value={i.toString().padStart(2, "0")}
                            >
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
                            <option
                              key={i}
                              value={i.toString().padStart(2, "0")}
                            >
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
                  <div className="">
                    <div className="d-flex justify-content-between">
                      <div className="d-flex">
                        <div className="">
                          <Button
                            title="Tambah Pertanyaan"
                            onClick={() => addQuestion("Essay")}
                            iconName="plus"
                            label="Tambah Soal"
                            classType="primary btn-sm px-3 py-2"
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
                            classType="primary btn-sm mx-2 px-3 py-2"
                            onClick={() =>
                              document.getElementById("fileInput").click()
                            }
                          />
                        </div>
                      </div>
                      {selectedFile && <span>{selectedFile.name}</span>}
                      <div className="d-flex">
                        <div className="mr-4">
                          <Button
                            title="Unggah File Excel"
                            iconName="paper-plane"
                            classType="primary btn-sm px-3 py-2"
                            onClick={handleUploadFile}
                            label="Unggah File"
                          />
                        </div>

                        <Button
                          iconName="download"
                          label="Unduh Template"
                          classType="warning btn-sm px-3 py-2 mx-2"
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
                        {(question.type === "Essay" ||
                        question.type === "Praktikum"
                          ? parseInt(question.point)
                          : 0) +
                          (question.type === "Pilgan"
                            ? (question.options || []).reduce(
                                (acc, option) => acc + parseInt(option.point),
                                0
                              )
                            : 0)}
                      </span>{" "}
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
                            value={question.text || ""}
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
                                    marginLeft: "10px",
                                  }}
                                >
                                  <img
                                    src={question.previewUrl}
                                    alt=""
                                    style={{
                                      width: "100%",
                                      height: "auto",
                                      objectFit: "contain",
                                    }}
                                  />
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
                                onChange={(e) =>
                                  handleJenisTypeChange(e, index)
                                }
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
                                    className="rounded-3"
                                    readOnly={question.type === "answer"}
                                    style={{ marginRight: "10px" }}
                                  />

                                  {!option.id && (
                                    <span className="badge bg-warning">
                                      Baru
                                    </span>
                                  )}

                                  <Button
                                    iconName="delete"
                                    classType="btn-sm ms-2 px-2 py-0"
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
                                style={{
                                  backgroundColor: "red",
                                  color: "white",
                                }}
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
                    </div>
                  </div>
                ))}
                <div className="d-flex justify-content-between">
                  <Button
                    classType="outline-secondary me-2 px-4 py-2"
                    label="Sebelumnya"
                    onClick={() =>
                      onChangePage("pretestEdit", AppContext_master.MateriForm)
                    }
                  />
                  {hasTest ? (
                    <Button
                      classType="primary ms-2 px-4 py-2"
                      type="submit"
                      label="Edit"
                      disabled={isSaving}
                    />
                  ) : null}
                </div>
                <div className="total-score-container">
                  Total Skor: {validateTotalPoints()}
                </div>
              </div>
            ) : (
              <>
                <div
                  className=""
                  style={{ marginLeft: "20px", marginRight: "20px" }}
                >
                  <Alert
                    type="warning"
                    message={
                      <span>
                        Post-Test belum ditambahkan.{" "}
                        <a
                          onClick={() =>
                            onChangePage(
                              "posttestEditNot",
                              (AppContext_master.MateriForm =
                                AppContext_master.DetailMateriEdit),
                              (AppContext_master.count += 1)
                            )
                          }
                          className="text-primary"
                        >
                          Tambah Data
                        </a>
                      </span>
                    }
                  />
                </div>
                <div className="d-flex justify-content-between ">
                  <div className="ml-4">
                    <Button
                      classType="outline-secondary me-2 px-4 py-2"
                      label="Sebelumnya"
                      onClick={() =>
                        onChangePage(
                          "pretestEdit",
                          AppContext_test.ForumForm,
                          AppContext_master.MateriForm,
                          (AppContext_master.count += 1)
                        )
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </div>
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
      </form>
    </>
  );
}
