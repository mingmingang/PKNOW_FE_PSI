import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../../util/Constants";
import {
  validateAllInputs,
  validateInput,
} from "../../../../util/ValidateForm";
import SweetAlert from "../../../../util/SweetAlert";
import UseFetch from "../../../../util/UseFetch";
import Button from "../../../../part/Button copy";
import Input from "../../../../part/Input";
import FileUpload from "../../../../part/FileUpload";
import Alert from "../../../../part/Alert";
import uploadFile from "../../../../util/UploadFile";
import AppContext_master from "../MasterContext";
import Editor from "../../../../part/CKEditor";
import AppContext_test from "../../master-test/TestContext";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import BackPage from "../../../../../assets/backPage.png";
import Konfirmasi from "../../../../part/Konfirmasi";
import { decode } from "he";

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

export default function PengenalanEdit({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKategori, setListKategori] = useState([]);
  const [isBackAction, setIsBackAction] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);

  const kategori = AppContext_test.KategoriIdByKK;
  const Materi = AppContext_test.DetailMateriEdit;

  const stripHTMLTags = (htmlContent) => {
    const doc = new DOMParser().parseFromString(htmlContent, "text/html");
    return doc.body.textContent || "";
  };

  const cleanedPengenalan = stripHTMLTags(Materi.Pengenalan);
  const formDataRef = useRef({
    mat_id: Materi.Key,
    kat_id: AppContext_test.KategoriIdByKK,
    mat_judul: Materi.Judul,
    mat_file_pdf: Materi.File_pdf,
    mat_file_video: Materi.File_video,
    mat_pengenalan: cleanedPengenalan,
    mat_keterangan: Materi.Keterangan,
    kry_id: AppContext_test.karyawanId,
    mat_kata_kunci: Materi["Kata Kunci"],
    mat_gambar: "",
    modifiedBy: AppContext_test.activeUser,
  });

  const userSchema = object({
    mat_id: string(),
    kat_id: string(),
    mat_judul: string().required("Judul materi harus diisi"),
    mat_file_pdf: string(),
    mat_file_video: string(),
    mat_pengenalan: string().required("Pengenalan materi harus diisi"),
    mat_keterangan: string()
      .required("Keterangan materi harus diisi")
      .min(100, "minimum 100 karakter")
      .max(200, "maksimum 200 karakter"),
    kry_id: string(),
    mat_kata_kunci: string().required("Kata kunci materi harus diisi"),
    mat_gambar: string(),
    modifiedBy: string(),
  });

  const handleGoBack = () => {
    setIsBackAction(true);
    setShowConfirmation(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmation(false);
    onChangePage("index");
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
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

  const handleFileChange = (ref, extAllowed) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file ? file.name : "";
    const fileSize = file ? file.size : 0;
    const fileExt = fileName.split(".").pop().toLowerCase();
    const validationError = validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024576 > 10) error = "berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "format berkas tidak valid";

    if (error) ref.current.value = "";
    else {
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
  };

  useEffect(() => {
    const fetchDataKategori = async (retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const data = await UseFetch(API_LINK + "Program/GetKategoriKKById", {
            kategori,
          });
          const mappedData = data.map((item) => ({
            value: item.Key,
            label: item["Nama Kategori"],
            idKK: item.idKK,
            namaKK: item.namaKK,
          }));
          setListKategori(mappedData);
          return;
        } catch (error) {
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            setIsError((prevError) => ({
              ...prevError,
              error: true,
              message: error.message,
            }));
            setListKategori([]);
          }
        }
      }
    };

    setIsError((prevError) => ({ ...prevError, error: false }));
    fetchDataKategori();
  }, [kategori]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      const uploadPromises = [];

      if (fileGambarRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(fileGambarRef.current).then(
            (data) => (formDataRef.current.mat_gambar = data.Hasil)
          )
        );
      }
      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "Materi/EditDataMateri",
          formDataRef.current
        );
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengedit data materi.");
        } else {
          SweetAlert("Sukses", "Data Materi berhasil diedit", "success");
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      } finally {
        setIsLoading(false);
      }
    } else window.scrollTo(0, 0);
  };

  const handlePageChange = (content) => {
    onChangePage(content);
  };

  const [filePreview, setFilePreview] = useState(false);
  const fileGambarRef = useRef(null);

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
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
            Edit Pengenalan Materi
          </h4>
        </div>
      </div>
      <form onSubmit={handleAdd} style={{ margin: "20px 100px" }}>
        <div className="mb-4">
          <CustomStepper
            activeStep={0}
            steps={steps}
            onChangePage={handlePageChange}
            getStepContent={getStepContent}
          />
        </div>
        <div className="card">
          <div className="card-body p-4">
            <div className="row">
              <div className="" style={{ display: "flex" }}>
                <div className="preview-img">
                  {filePreview ? (
                    <div
                      style={{
                        marginTop: "10px",
                        marginRight: "30px",
                      }}
                    >
                      <img
                        src={filePreview}
                        alt="Preview"
                        style={{
                          width: "200px",
                          height: "auto",
                          borderRadius: "20px",
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: "10px",
                        marginRight: "30px",
                      }}
                    >
                      <img
                        src={`${API_LINK}Upload/GetFile/${AppContext_test.DetailMateriEdit.Gambar}`}
                        alt="No Preview Available"
                        style={{
                          width: "200px",
                          height: "auto",
                          borderRadius: "20px",
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="">
                  <FileUpload
                    forInput="gambarMateri"
                    label="Gambar Materi (.jpg, .png)"
                    formatFile=".jpg,.png"
                    ref={fileGambarRef}
                    onChange={() => handleFileChange(fileGambarRef, "png,jpg")}
                    errorMessage={errors.gambar}
                    isRequired={true}
                    style={{ maxWidth: "100%" }}
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="namaKK"
                  label="Kelompok Keahlian"
                  value={
                    listKategori.length > 0
                      ? decode(
                          listKategori.find(
                            (item) => item.value === formDataRef.current.kat_id
                          )?.namaKK || "Nama tidak tersedia"
                        )
                      : "Nama tidak tersedia"
                  }
                  disabled
                  errorMessage={errors.namaKK}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="kat_id"
                  label="Kategori Program"
                  value={
                    listKategori.length > 0
                      ? decode(
                          listKategori.find(
                            (item) => item.value === formDataRef.current.kat_id
                          )?.label || "Label tidak tersedia"
                        )
                      : "Label tidak tersedia"
                  }
                  disabled
                  errorMessage={errors.kat_id}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="mat_judul"
                  label="Judul Materi"
                  placeholder="Judul Materi"
                  value={
                    formDataRef.current.mat_judul
                      ? decode(formDataRef.current.mat_judul)
                      : "Judul tidak tersedia"
                  }
                  onChange={handleInputChange}
                  errorMessage={errors.mat_judul}
                  isRequired
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="mat_kata_kunci"
                  label="Kata Kunci Materi"
                  placeholder="Kata Kunci Materi"
                  value={
                    formDataRef.current.mat_kata_kunci
                      ? decode(formDataRef.current.mat_kata_kunci)
                      : "Kata kunci tidak tersedia"
                  }
                  onChange={handleInputChange}
                  errorMessage={errors.mat_kata_kunci}
                  isRequired
                />
              </div>
              <div className="col-lg-16">
                <Input
                  type="textarea"
                  forInput="mat_keterangan"
                  label="Keterangan Materi"
                  isRequired
                  value={formDataRef.current.mat_keterangan}
                  onChange={handleInputChange}
                  errorMessage={errors.mat_keterangan}
                />
              </div>
              <div className="col-lg-16">
                <div className="form-group">
                  <label
                    htmlFor="deskripsiMateri"
                    className="form-label fw-bold"
                  >
                    Pengenalan Materi <span style={{ color: "Red" }}> *</span>
                  </label>
                  <Editor
                    value={formDataRef.current.mat_pengenalan}
                    onChange={(content) => {
                      handleInputChange({
                        target: {
                          name: "mat_pengenalan",
                          value: content,
                        },
                      });
                    }}
                    disabled={isFormDisabled}
                  />
                  {errors.mat_pengenalan && (
                    <div className="invalid-feedback d-block">
                      {errors.mat_pengenalan}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-between my-4  mt-0">
              <div className="ml-4"></div>
              <div className="d-flex">
                <div className="mr-2">
                  <Button
                    classType="primary ms-2 px-4 py-2"
                    type="submit"
                    label="Edit"
                  />
                </div>
                <Button
                  classType="primary ms-3 px-4 py-2"
                  label="Berikutnya"
                  onClick={() =>
                    onChangePage(
                      "materiEdit",
                      (AppContext_master.MateriForm =
                        AppContext_test.DetailMateriEdit),
                      (AppContext_master.count += 1),
                      AppContext_test.DetailMateriEdit
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </form>
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
