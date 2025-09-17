import { useRef, useState } from "react";
import Button from "../../../part/Button";
import { object, string } from "yup";
import Input from "../../../part/Input";
import Loading from "../../../part/Loading";
import * as XLSX from "xlsx";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import { API_LINK } from "../../../util/Constants";
import FileUpload from "../../../part/FileUpload";
import uploadFile from "../../../util/UploadImageQuiz";
import Swal from "sweetalert2";
import Editor from "../../../../part/CKEditor";
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
import { Stepper, Step, StepLabel } from "@mui/material";
import UseFetch from "../../../../util/UseFetch";

const steps = ["Materi", "Pretest", "Sharing Expert", "Forum", "Post Test"];

function getStepContent(stepIndex) {
  switch (stepIndex) {
    case 0:
      return "materiAdd";
    case 1:
      return "pretestAdd";
    case 2:
      return "sharingAdd";
    case 3:
      return "forumAdd";
    case 4:
      return "posttestAdd";
    default:
      return "Unknown stepIndex";
  }
}
export default function MasterPreTestAdd({ onChangePage }) {
  const [formContent, setFormContent] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [timer, setTimer] = useState("");
  const [isFormDisabled, setIsFormDisabled] = useState(false);

  const [resetStepper, setResetStepper] = useState(0);
  const handleChange = (name, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const [formQuestion, setFormQuestion] = useState({
    quizId: "",
    soal: "",
    tipeQuestion: "Essay",
    gambar: null,
    questionDeskripsi: "",
    status: "Aktif",
    quecreatedby: AppContext_test.displayName,
  });

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
      text: `Pertanyaan ${formContent.length + 1}`,
      options: [],
      point: 0,
      correctAnswer: "",
    };
    setFormContent([...formContent, newQuestion]);
    setSelectedOptions([...selectedOptions, ""]);
  };

  const [formData, setFormData] = useState({
    materiId: AppContext_master.DetailMateri?.Key || "",
    quizJudul: "",
    quizDeskripsi: "",
    quizTipe: "Pretest",
    tanggalAwal: "",
    tanggalAkhir: "",
    timer: "",
    status: "Aktif",
    createdby: AppContext_test.DisplayName,
  });

  formData.timer = timer;

  const [formChoice, setFormChoice] = useState({
    urutanChoice: "",
    isiChoice: "",
    questionId: "",
    nilaiChoice: "",
    quecreatedby: AppContext_test.DisplayName,
  });

  const userSchema = object({
    materiId: string(),
    quizJudul: string(),
    quizDeskripsi: string().required("Quiz deskripsi harus diisi"),
    quizTipe: string(),
    tanggalAwal: string().required("Tanggal awal harus diisi"),
    tanggalAkhir: string().required("Tanggal akhir harus diisi"),
    timer: string().required("Durasi harus diisi"),
    status: string(),
    createdby: string(),
  });

  const handleQuestionTypeChange = (e, index) => {
    const updatedFormContent = [...formContent];
    updatedFormContent[index].type = e.target.value;
    setFormContent(updatedFormContent);
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

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const isStartDateBeforeEndDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    formData.timer = convertTimeToSeconds(timer);
    const validationErrors = await validateAllInputs(
      formData,
      userSchema,
      setErrors
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Swal.fire({
        title: "Gagal!",
        text: "Pastikan semua data terisi dengan benar!.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    if (
      !isStartDateBeforeEndDate(formData.tanggalAwal, formData.tanggalAkhir)
    ) {
      Swal.fire({
        title: "Error!",
        text: "Tanggal awal tidak boleh lebih dari tanggal akhir.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    for (let question of formContent) {
      if (question.type === "Pilgan" && question.options.length < 2) {
        Swal.fire({
          title: "Gagal!",
          text: "Opsi pilihan ganda harus lebih dari satu",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
    }

    const totalQuestionPoint = formContent.reduce((total, question) => {
      if (question.type !== "Pilgan") {
        total = total + parseInt(question.point);
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
      Swal.fire({
        title: "Gagal!",
        text: "Total skor harus berjumlah 100",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      formData.timer = convertTimeToSeconds(timer);
      const response = await UseFetch(API_LINK + "Quiz/SaveDataQuiz", formData);

      if (response === "ERROR" || response.length === 0) {
        Swal.fire({
          title: "Gagal!",
          text: "Data yang dimasukkan tidak valid atau kurang",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      const quizId = response[0].hasil;

      for (let i = 0; i < formContent.length; i++) {
        const question = formContent[i];
        const formQuestion = {
          quizId: quizId,
          soal: question.text,
          tipeQuestion: question.type,
          gambar: question.gambar,
          questionDeskripsi: "",
          status: "Aktif",
          quecreatedby: AppContext_test.DisplayName,
        };

        if (question.type === "Essay" || question.type === "Praktikum") {
          if (question.selectedFile) {
            try {
              const uploadResult = await uploadFile(question.selectedFile);
              formQuestion.gambar = uploadResult.newFileName;
            } catch (uploadError) {
              alert(
                "Gagal mengunggah gambar untuk pertanyaan: " + question.text
              );
              return;
            }
          } else {
            formQuestion.gambar = null;
          }
        } else if (question.type === "Pilgan") {
          formQuestion.gambar = "";
        }

        try {
          const questionResponse = await UseFetch(
            API_LINK + "Questions/SaveDataQuestion",
            formQuestion
          );

          if (questionResponse === "ERROR" || questionResponse.length === 0) {
            Swal.fire({
              title: "Gagal!",
              text: "Data yang dimasukkan tidak valid atau kurang",
              icon: "error",
              confirmButtonText: "OK",
            });
            return;
          }

          const questionId = questionResponse[0].hasil;

          if (question.type === "Essay" || question.type === "Praktikum") {
            const answerData = {
              urutanChoice: "",
              answerText: question.correctAnswer ? question.correctAnswer : "0",
              questionId: questionId,
              nilaiChoice: question.point,
              quecreatedby: AppContext_test.DisplayName,
            };

            const answerResponse = await UseFetch(
              API_LINK + "Choices/SaveDataChoice",
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
                quecreatedby: AppContext_test.DisplayName,
              };

              const answerResponse = await UseFetch(
                API_LINK + "Choices/SaveDataChoice",
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
        text: "Pretest berhasil ditambahkan",
        icon: "success",
        confirmButtonText: "OK",
      }).then((result) => {
        if (result.isConfirmed) {
          setFormContent([]);
          setSelectedOptions([]);
          setErrors({});
          setSelectedFile(null);
          setTimer("");
          setIsButtonDisabled(true);
          onChangePage("pretestDetail");
        }
      });
    } catch (error) {
      Swal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat menyimpan data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleOptionLabelChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;
    const updatedFormContent = [...formContent];
    updatedFormContent[questionIndex].options[optionIndex].label = value;
    setFormContent(updatedFormContent);
  };

  const handleOptionChange = (e, index) => {
    const { value } = e.target;

    const updatedFormContent = [...formContent];
    updatedFormContent[index].correctAnswer = value;
    setFormContent(updatedFormContent);

    const updatedSelectedOptions = [...selectedOptions];
    updatedSelectedOptions[index] = value;
    setSelectedOptions(updatedSelectedOptions);
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

  const handleDeleteOption = (questionIndex, optionIndex) => {
    const updatedFormContent = [...formContent];
    updatedFormContent[questionIndex].options.splice(optionIndex, 1);
    setFormContent(updatedFormContent);
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

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    const updatedFormContent = [...formContent];
    updatedFormContent[index].selectedFile = file;

    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.onload = () => {
        updatedFormContent[index].imageWidth = image.width;
        updatedFormContent[index].imageHeight = image.height;
        setFormContent(updatedFormContent);
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
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
        text: "Pilih file excel terlebih dahulu",
        icon: "error",
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

    updatedFormContent[questionIndex].options[optionIndex].point =
      parseInt(value);

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

  const [activeStep, setActiveStep] = useState(1);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
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

  if (isLoading) return <Loading />;

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
      <form id="myForm" onSubmit={handleAdd}>
        <div>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step
                key={label}
                onClick={() => onChangePage(getStepContent(index))}
              >
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <div>
            {activeStep === steps.length ? (
              <div>
                <Button onClick={handleReset}>Reset</Button>
              </div>
            ) : (
              <div>
                <Button disabled={activeStep === 0} onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header bg-outline-primary fw-medium text-black">
            Tambah Pretest Baru
          </div>
          <div className="card-body p-4">
            <div className="row mb-4">
              <div className="col-lg">
                <Input
                  type="text"
                  label="Deskripsi"
                  value={formData.quizDeskripsi}
                  onChange={handleInputChange}
                  isRequired={true}
                  forInput="quizDeskripsi"
                  errorMessage={errors.quizDeskripsi}
                />
              </div>
            </div>
            <div className="row mb-4">
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
              <div className="col-lg-4">
                <Input
                  label="Tanggal Dimulai:"
                  type="date"
                  value={formData.tanggalAwal}
                  onChange={(e) => handleChange("tanggalAwal", e.target.value)}
                  isRequired={true}
                  forInput="tanggalAwal"
                  errorMessage={errors.tanggalAwal}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  label="Tanggal Berakhir:"
                  type="date"
                  value={formData.tanggalAkhir}
                  onChange={(e) => handleChange("tanggalAkhir", e.target.value)}
                  isRequired={true}
                  forInput="tanggalAkhir"
                  errorMessage={errors.tanggalAkhir}
                />
              </div>
            </div>
            <div className="row mb-4">
              <div className="mb-2"></div>
              <div className="col-lg-4">
                <Button
                  title="Tambah Pertanyaan"
                  onClick={() => addQuestion("Essay")}
                  iconName="plus"
                  classType="primary btn-sm px-3 py-1"
                />
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={handleFileExcel}
                  accept=".xls, .xlsx"
                />
                <Button
                  title="Tambah File Excel"
                  iconName="upload"
                  classType="primary btn-sm mx-2 px-3 py-1"
                  onClick={() => document.getElementById("fileInput").click()}
                />
                {selectedFile && <span>{selectedFile.name}</span>}
                <br></br>
                <br></br>
                <Button
                  title="Unggah File Excel"
                  iconName="paper-plane"
                  classType="primary btn-sm px-3 py-1"
                  onClick={handleUploadFile}
                  label="Unggah File"
                />

                <Button
                  iconName="download"
                  label="Unduh Template"
                  classType="warning btn-sm px-3 py-1 mx-2"
                  onClick={handleDownloadTemplate}
                  title="Unduh Template Excel"
                />
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
                        <div className="d-flex flex-column w-100">
                          <FileUpload
                            forInput={`fileInput_${index}`}
                            formatFile=".jpg,.png"
                            label={
                              <span className="file-upload-label">
                                Gambar (.jpg, .png)
                              </span>
                            }
                            onChange={(e) => handleFileChange(e, index)}
                            hasExisting={question.gambar}
                            style={{ fontSize: "12px" }}
                          />
                          {question.selectedFile && (
                            <div
                              style={{
                                maxWidth: "300px",
                                maxHeight: "300px",
                                overflow: "hidden",
                                marginLeft: "10px",
                              }}
                            >
                              <img
                                src={URL.createObjectURL(question.selectedFile)}
                                alt="Preview Gambar"
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  objectFit: "contain",
                                }}
                              />
                            </div>
                          )}
                          <div className="mt-2">
                            {" "}
                            <Input
                              type="number"
                              label="Skor"
                              value={question.point}
                              onChange={(e) => handlePointChange(e, index)}
                              isRequired={true}
                            />
                          </div>
                        </div>
                      )}
                      {question.type === "Pilgan" && (
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
                                type="radio"
                                id={`option_${index}_${optionIndex}`}
                                name={`option_${index}`}
                                value={option.value}
                                checked={
                                  selectedOptions[index] === option.value
                                }
                                onChange={(e) => handleOptionChange(e, index)}
                                style={{ marginRight: "10px" }}
                              />
                              <input
                                type="text"
                                value={option.label}
                                onChange={(e) =>
                                  handleOptionLabelChange(e, index, optionIndex)
                                }
                                className="option-input"
                                readOnly={question.type === "answer"}
                                style={{ marginRight: "10px" }}
                              />
                              <Button
                                iconName="delete"
                                classType="btn-sm ms-2 px-2 py-0"
                                onClick={() =>
                                  handleDeleteOption(index, optionIndex)
                                }
                                style={{ marginRight: "10px" }}
                              />
                              <input
                                type="number"
                                id={`optionPoint_${index}_${optionIndex}`}
                                value={option.point}
                                className="btn-sm ms-2 px-2 py-0"
                                onChange={(e) =>
                                  handleOptionPointChange(e, index, optionIndex)
                                }
                                style={{ width: "50px" }}
                              />
                            </div>
                          ))}
                          <Button
                            onClick={() => handleAddOption(index)}
                            iconName="add"
                            classType="success btn-sm ms-2 px-3 py-1"
                            label="Opsi Baru"
                          />
                        </div>
                      )}
                      <div className="d-flex justify-content-between my-2 mx-1">
                        <div></div>
                        <div>
                          <Button
                            iconName="trash"
                            classType="btn-sm ms-2 px-3 py-1"
                            onClick={() => handleDeleteQuestion(index)}
                          />
                          <Button
                            iconName="duplicate"
                            classType="btn-sm ms-2 px-3 py-1"
                            onClick={() => handleDuplicateQuestion(index)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="total-score-container">
          Total Skor: {validateTotalPoints()}
        </div>
        <div className="float my-4 mx-1">
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="Simpan"
            disabled={isButtonDisabled}
          />
        </div>
      </form>
    </>
  );
}
