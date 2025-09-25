import { useRef, useState, useEffect } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../../util/Constants";
import {
  validateAllInputs,
  validateInput,
} from "../../../../util/ValidateForm";
import SweetAlert from "../../../../util/SweetAlert";
import UseFetch from "../../../../util/UseFetch";
import Button from "../../../../part/Button copy";
import FileUpload from "../../../../part/FileUpload";
import uploadFile from "../../../../util/UploadFile";
import Alert from "../../../../part/Alert";
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
import BackPage from "../../../../../assets/backPage.png";
import Konfirmasi from "../../../../part/Konfirmasi";
import CustomStepper from "../../../../part/Stepp";

export default function MastermateriAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKategori, setListKategori] = useState([]);
  const [isFileDisabled, setIsFileDisabled] = useState(false);
  const fileInputRef = useRef(null);
  const vidioInputRef = useRef(null);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  const Forum = AppContext_test.ForumForm;

  const previewFile = async (namaFile, fileType = "") => {
    try {
      namaFile = namaFile.trim();

      const isPDF =
        fileType === "application/pdf" ||
        namaFile.toLowerCase().endsWith(".pdf");

      if (isPDF) {
        const apiUrl = `${API_LINK}Upload/GetFile/${namaFile}?inline=true`;
        const shortFileName = namaFile.split("_")[1] || namaFile.split(".")[0];
        const newWindow = window.open(apiUrl, "_blank");

        if (newWindow) {
          setTimeout(() => {
            try {
              newWindow.document.title = shortFileName;
            } catch (e) {}
          }, 500);
        }
      } else {
        const response = await fetch(`${API_LINK}Upload/GetFile/${namaFile}`, {
          method: "GET",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("jwtToken"),
          },
        });

        if (!response.ok) {
          throw new Error("Tidak dapat mengambil file");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const judulMateri =
          AppContext_master.MateriForm?.Judul || "SharingExpert";
        const formattedFileName = `Sharing Expert - ${judulMateri}`;

        const link = document.createElement("a");
        link.href = url;

        let extension = "";
        const actualFileType = fileType || blob.type;
        if (actualFileType.includes("video")) extension = ".mp4";
        else if (actualFileType.includes("word")) extension = ".docx";
        else if (actualFileType.includes("excel")) extension = ".xlsx";
        else if (actualFileType.includes("powerpoint")) extension = ".pptx";
        else if (actualFileType.includes("zip")) extension = ".zip";
        else {
          const originalExt = namaFile.split(".").pop();
          extension = originalExt ? `.${originalExt}` : "";
        }

        link.download = `${formattedFileName}${extension}`;
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    } catch (error) {
      alert("Tidak dapat menampilkan pratinjau. Silakan unduh file.");
    }
  };

  const kategori = AppContext_master.KategoriIdByKK;

  const formDataRef = useRef({
    mat_id: AppContext_master.dataIDMateri,
    kat_id: AppContext_master.KategoriIdByKK,
    mat_judul: "",
    mat_file_pdf: "",
    mat_file_video: "",
    mat_pengenalan: "",
    mat_keterangan: "",
    kry_id: AppContext_test.karyawanId,
    mat_kata_kunci: "",
    mat_gambar: "",
    createBy: AppContext_test.activeUser,
  });

  const userSchema = object({
    mat_id: string(),
    kat_id: string(),
    mat_judul: string(),
    mat_file_pdf: string(),
    mat_file_video: string(),
    mat_pengenalan: string(),
    mat_keterangan: string(),
    kry_id: string(),
    mat_kata_kunci: string(),
    mat_gambar: string(),
    createBy: string(),
    createdBy: string(),
  });

  const handlePdfChange = () =>
    handleFileChange(fileInputRef, "pdf,docx,xlsx,pptx", 10);
  const handleVideoChange = () =>
    handleFileChange(vidioInputRef, "mp4,mov", 250);

  const handleFileChange = async (ref, extAllowed, maxFileSize) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop();
    const validationError = await validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024 / 1024 > maxFileSize) {
      error = `Berkas terlalu besar, maksimal ${maxFileSize}MB`;
      SweetAlert("Error", error, "error");
    } else if (!extAllowed.split(",").includes(fileExt)) {
      error = "Format berkas tidak valid";
      SweetAlert("Error", error, "error");
    }

    if (error) ref.current.value = "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsFormSubmitted(true);
      setIsLoading(true);
      setIsError((prevError) => {
        return { ...prevError, error: false };
      });
      setErrors({});

      const uploadPromises = [];

      let hasPdfFile = false;
      let hasVideoFile = false;
      const isPdfEmpty = !fileInputRef.current.files.length;
      const isVideoEmpty = !vidioInputRef.current.files.length;

      if (
        AppContext_test.materiVideo === "" &&
        AppContext_test.materiPdf === ""
      ) {
        if (isPdfEmpty && isVideoEmpty) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            mat_file_pdf: "Pilih salah satu antara PDF atau Video",
            mat_file_video: "Pilih salah satu antara PDF atau Video",
          }));
          setIsLoading(false);
          return;
        }
      }

      if (fileInputRef.current && fileInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(fileInputRef.current).then((data) => {
            formDataRef.current["mat_file_pdf"] = data.Hasil;
            AppContext_test.materiPdf = data.Hasil;
            hasPdfFile = true;
          })
        );
      }

      if (vidioInputRef.current && vidioInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(vidioInputRef.current).then((data) => {
            formDataRef.current["mat_file_video"] = data.Hasil;
            AppContext_test.materiVideo = data.Hasil;
            hasVideoFile = true;
          })
        );
      }

      Promise.all(uploadPromises)
        .then(() => {
          if (
            AppContext_test.materiVideo == null ||
            AppContext_test.materiPdf == null
          ) {
            if (!hasPdfFile && !hasVideoFile) {
              setIsLoading(false);
              SweetAlert(
                "Terjadi Kesalahan!",
                "Harus memilih salah satu file PDF atau file video, tidak boleh keduanya kosong.",
                "error"
              );
              return;
            }
          }

          return UseFetch(
            API_LINK + "Materi/UpdateSaveDataMateri",
            formDataRef.current
          );
        })
        .then((data) => {
          if (data === "ERROR") {
            throw new Error("Gagal menyimpan data Materi.");
          }

          if (data && data.length > 0 && data[0].hasil === "OK") {
            setIsFileDisabled(false);
            AppContext_master.formSavedMateriFile = true;
            if (typeof Forum === "undefined" || Forum.forumIsi === "") {
              onChangePage(
                "forumAdd",
                AppContext_master.MateriForm,
                (AppContext_master.count += 1),
                AppContext_test.ForumForm,
                AppContext_master.dataIdSection,
                AppContext_master.dataSectionSharing,
                AppContext_master.dataIdSectionSharing,
                AppContext_master.dataIdSectionPretest,
                AppContext_master.dataPretest,
                AppContext_master.dataQuizPretest,
                AppContext_master.dataPostTest,
                AppContext_master.dataQuizPostTest,
                AppContext_master.dataTimerPostTest
              );
            } else {
              onChangePage(
                "forumBefore",
                AppContext_master.MateriForm,
                (AppContext_master.count += 1),
                AppContext_test.ForumForm,
                AppContext_master.dataIdSection,
                AppContext_master.dataSectionSharing,
                AppContext_master.dataIdSectionSharing,
                AppContext_master.dataIdSectionPretest,
                AppContext_master.dataPretest,
                AppContext_master.dataQuizPretest,
                AppContext_master.dataPostTest,
                AppContext_master.dataQuizPostTest,
                AppContext_master.dataTimerPostTest
              );
            }
          } else {
            throw new Error("Response tidak valid dari server");
          }
        })
        .catch((error) => {
          setIsError((prevError) => ({
            ...prevError,
            error: true,
            message: "Terjadi kesalahan: " + error.message,
          }));
        })
        .finally(() => setIsLoading(false));
    }
  };

  const fetchDataKategori = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const data = await UseFetch(API_LINK + "Program/GetKategoriKKById", {
          kategori,
        });

        if (data === "ERROR") {
          throw new Error("Gagal mengambil data kategori");
        }

        const mappedData = data.map((item) => ({
          value: item.Key,
          label: item["Nama Kategori"],
          idKK: item.idKK,
          namaKK: item.namaKK,
        }));
        return mappedData;
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
    let isMounted = true;

    const fetchData = async () => {
      setIsError({ error: false, message: "" });
      setIsLoading(true);
      try {
        const data = await fetchDataKategori();
        if (isMounted) {
          setListKategori(data);
        }
      } catch (error) {
        if (isMounted) {
          setIsError({ error: true, message: error.message });
          setListKategori([]);
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
  }, [kategori]);

  const initialSteps = ["Pengenalan", "Materi", "Forum"];
  const additionalSteps = ["Sharing Expert", "Pre-Test", "Post-Test"];

  const handleStepAdded = (stepName) => {};

  const handleStepRemoved = (stepName) => {};

  const handleStepChange = (stepContent) => {
    onChangePage(stepContent);
  };

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <style>
        {`
          .mce-notification {
            display: none !important;
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
            Tambah Materi Baru
          </h4>
        </div>
        <div className="ket-draft">
          <span className="badge text-bg-dark " style={{ fontSize: "16px" }}>
            Draft
          </span>
        </div>
      </div>
      <form onSubmit={handleAdd} style={{ margin: "20px 100px" }}>
        <div className="mb-4">
          <CustomStepper
            initialSteps={initialSteps}
            additionalSteps={additionalSteps}
            onChangeStep={1}
            onStepAdded={handleStepAdded}
            onStepRemoved={handleStepRemoved}
            onChangePage={handleStepChange}
          />
        </div>

        <div className="card mb-4">
          <div className="card-body p-4">
            <div className="row">
              <div className="">
                <FileUpload
                  ref={fileInputRef}
                  forInput="mat_file_pdf"
                  label="File Materi (.pdf, .docx, .xlsx, .pptx)"
                  formatFile=".pdf,.docx,.xlsx,.pptx,.mp4"
                  onChange={() =>
                    handlePdfChange(fileInputRef, "pdf,docx,xlsx,pptx")
                  }
                  errorMessage={errors.mat_file_pdf}
                  style={{ maxWidth: "100%" }}
                />
                {AppContext_test.materiPdf && (
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none mt-0"
                    onClick={(e) => {
                      e.preventDefault();
                      previewFile(AppContext_test.materiPdf);
                    }}
                  >
                    Lihat berkas yang telah diunggah
                  </a>
                )}
              </div>
              <div className="">
                <FileUpload
                  ref={vidioInputRef}
                  forInput="mat_file_video"
                  label="File Materi (.mp4, .mov)"
                  formatFile=".mp4,.mov"
                  maxFileSize={250}
                  onChange={() => handleVideoChange(vidioInputRef, "mp4,mov")}
                  errorMessage={errors.mat_file_video}
                  style={{ maxWidth: "100%" }}
                />
                {AppContext_test.materiVideo && (
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      previewFile(AppContext_test.materiVideo);
                    }}
                    className="text-decoration-none mt-0"
                  >
                    Lihat berkas yang telah diunggah
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-between my-4 mx-1 mt-0">
            <div className="ml-4">
              <Button
                classType="outline-secondary me-2 px-4 py-2"
                label="Sebelumnya"
                onClick={() =>
                  onChangePage(
                    "pengenalanBefore",
                    AppContext_master.MateriForm,
                    AppContext_master.dataIDMateri,
                    AppContext_master.dataIdSection,
                    AppContext_master.dataSectionSharing,
                    AppContext_master.dataIdSectionSharing,
                    AppContext_master.dataIdSectionPretest,
                    AppContext_master.dataIdSectionPostTest,
                    AppContext_master.dataPretest,
                    AppContext_master.dataQuizPretest,
                    AppContext_master.dataPostTest,
                    AppContext_master.dataQuizPostTest,
                    AppContext_test.ForumForm,
                    AppContext_master.dataTimerQuizPreTest,
                    AppContext_master.dataTimerPostTest
                  )
                }
              />
            </div>
            <div className="d-flex mr-4">
              <Button
                classType="primary ms-2 px-4 py-2"
                type="submit"
                label="Berikutnya"
                style={{ marginRight: "10px" }}
              />
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
