import { useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../../util/Constants";
import { validateAllInputs } from "../../../../util/ValidateForm";
import SweetAlert from "../../../../util/SweetAlert";
import UseFetch from "../../../../util/UseFetch";
import Button from "../../../../part/Button copy";
import FileUpload from "../../../../part/FileUpload";
import Loading from "../../../../part/Loading";
import Alert from "../../../../part/Alert";
import AppContext_test from "../MasterContext";
import uploadFile from "../../../../util/UploadFile";
import AppContext_master from "../MasterContext";
import Konfirmasi from "../../../../part/Konfirmasi";
import BackPage from "../../../../../assets/backPage.png";
import CustomStepper from "../../../../part/Stepp";
import Cookies from "js-cookie";
import { decryptId } from "../../../../util/Encryptor";

export default function MasterSharingAdd({ onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fileInputRef = useRef(null);
  const vidioInputRef = useRef(null);
  const storedSteps = sessionStorage.getItem("steps");
  const steps = storedSteps ? JSON.parse(storedSteps) : initialSteps;

  const sharingExpertIndex = steps.findIndex(
    (step) => step === "Sharing Expert"
  );

  const formDataRef = useRef({
    materiId: AppContext_master.dataIDMateri,
    secJudul: "Section Materi " + AppContext_master.dataIDMateri,
    createdby: activeUser,
    secType: "Sharing Expert",
    mat_sharing_expert_pdf: "",
    mat_sharing_expert_video: "",
  });

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

  const userSchema = object({
    materiId: string(),
    secJudul: string(),
    createdby: string(),
    secType: string(),
    mat_sharing_expert_pdf: string(),
    mat_sharing_expert_video: string(),
  });

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
  
  const handlePdfChange = () =>
    handleFileChange(fileInputRef, "pdf,docx,xlsx,pptx", 10);

  const handleVideoChange = () =>
    handleFileChange(vidioInputRef, "mp4,mov", 250);

  const handleFileChange = async (ref, extAllowed, maxFileSize) => {
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop();
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
      [ref.current.name]: error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    const isPdfEmpty = !fileInputRef.current.files.length;
    const isVideoEmpty = !vidioInputRef.current.files.length;

    if (
      typeof AppContext_test.sharingExpertVideo === "undefined" &&
      typeof AppContext_test.sharingExpertPDF === "undefined"
    ) {
      if (isPdfEmpty && isVideoEmpty) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          mat_sharing_expert_pdf: "Pilih salah satu antara PDF atau Video",
          mat_sharing_expert_video: "Pilih salah satu antara PDF atau Video",
        }));
        return;
      }
    }

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});

      const uploadPromises = [];

      if (fileInputRef.current && fileInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(fileInputRef.current).then((data) => {
            formDataRef.current.mat_sharing_expert_pdf = data.Hasil;
            AppContext_test.sharingExpertPDF = data.Hasil;
          })
        );
      }

      if (vidioInputRef.current && vidioInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(vidioInputRef.current).then((data) => {
            formDataRef.current.mat_sharing_expert_video = data.Hasil;
            AppContext_test.sharingExpertVideo = data.Hasil;
          })
        );
      }

      if (
        typeof AppContext_test.sharingExpertVideo === "undefined" &&
        typeof AppContext_test.sharingExpertPDF === "undefined"
      ) {
        Promise.all(uploadPromises).then(() => {
          UseFetch(API_LINK + "Section/CreateSection", formDataRef.current)
            .then((data) => {
              AppContext_master.dataIdSectionSharing = data[0].newID;
              if (data === "ERROR") {
                setIsError({
                  error: true,
                  message: "Terjadi kesalahan: Gagal menyimpan data Sharing.",
                });
              } else {
                AppContext_master.dataSectionSharing = formDataRef;
                if (steps.length === 4) {
                  window.location.reload();
                } else {
                  if (sharingExpertIndex == 3 && steps.length === 5) {
                    onChangePage(
                      steps[4],
                      AppContext_master.MateriForm,
                      (AppContext_master.count += 1),
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
                    );
                  } else if (sharingExpertIndex === 4 && steps.length === 6) {
                    onChangePage(
                      steps[5],
                      AppContext_master.Materi,
                      (AppContext_master.count += 1),
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
                    );
                  } else if (sharingExpertIndex === 3 && steps.length === 6) {
                    onChangePage(
                      steps[4],
                      AppContext_master.Materi,
                      (AppContext_master.count += 1),
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
                    );
                  } else if (sharingExpertIndex == 4 && steps.length === 5) {
                    window.location.reload();
                  } else if (steps.length === 6 && sharingExpertIndex === 5) {
                    window.location.reload();
                  }
                }
              }
            })
            .catch((err) => {
              setIsError({
                error: true,
                message: "Terjadi kesalahan: " + err.message,
              });
            })
            .finally(() => setIsLoading(false));
        });
      } else {
        Promise.all(uploadPromises).then(() => {
          UseFetch(API_LINK + "SharingExpert/SaveDataSharing", {
            secId: AppContext_master.dataIdSectionSharing,
            matId: "",
            sharingPdf: formDataRef.current.mat_sharing_expert_pdf,
            sharingVideo: formDataRef.current.mat_sharing_expert_video,
            dataSection: "",
            secType: "Sharig Expert",
            karyawan: activeUser,
          })
            .then((data) => {
              if (data === "ERROR") {
                setIsError({
                  error: true,
                  message: "Terjadi kesalahan: Gagal menyimpan data Sharing.",
                });
              } else {
                AppContext_master.dataSectionSharing = formDataRef;
                if (steps.length == 4) {
                  window.location.reload();
                } else {
                  if (sharingExpertIndex == 3 && steps.length === 5) {
                    onChangePage(
                      steps[4],
                      AppContext_master.MateriForm,
                      (AppContext_master.count += 1),
                      AppContext_master.dataIdSection,
                      AppContext_master.dataSectionSharing,
                      AppContext_master.dataIdSectionSharing,
                      AppContext_master.dataIdSectionPretest,
                      AppContext_master.dataIdSectionPostTest,
                      AppContext_master.dataPretest,
                      AppContext_master.dataQuizPretest,
                      AppContext_master.dataPostTest,
                      AppContext_master.dataQuizPostTest,
                      AppContext_master.dataTimerQuizPreTest,
                      AppContext_master.dataTimerPostTest
                    );
                  } else if (sharingExpertIndex == 3 && steps.length === 6) {
                    onChangePage(
                      steps[4],
                      AppContext_master.MateriForm,
                      (AppContext_master.count += 1),
                      AppContext_master.dataIdSection,
                      AppContext_master.dataSectionSharing,
                      AppContext_master.dataIdSectionSharing,
                      AppContext_master.dataIdSectionPretest,
                      AppContext_master.dataIdSectionPostTest,
                      AppContext_master.dataPretest,
                      AppContext_master.dataQuizPretest,
                      AppContext_master.dataPostTest,
                      AppContext_master.dataQuizPostTest,
                      AppContext_master.dataTimerQuizPreTest,
                      AppContext_master.dataTimerPostTest
                    );
                  } else if (sharingExpertIndex == 4 && steps.length === 6) {
                    onChangePage(
                      steps[5],
                      AppContext_master.MateriForm,
                      (AppContext_master.count += 1),
                      AppContext_master.dataIdSection,
                      AppContext_master.dataSectionSharing,
                      AppContext_master.dataIdSectionSharing,
                      AppContext_master.dataIdSectionPretest,
                      AppContext_master.dataIdSectionPostTest,
                      AppContext_master.dataPretest,
                      AppContext_master.dataQuizPretest,
                      AppContext_master.dataPostTest,
                      AppContext_master.dataQuizPostTest,
                      AppContext_master.dataTimerQuizPreTest,
                      AppContext_master.dataTimerPostTest
                    );
                  } else if (sharingExpertIndex === 5) {
                    window.location.reload();
                  } else {
                    window.location.reload();
                  }
                }
              }
            })
            .catch((err) => {
              setIsError({
                error: true,
                message: "Terjadi kesalahan: " + err.message,
              });
            })
            .finally(() => setIsLoading(false));
        });
      }
    }
  };

  const handleSebelumnya = () => {
    if (steps.length == 4) {
      onChangePage(
        "forumBefore",
        AppContext_test.MateriForm,
        AppContext_test.ForumForm,
        AppContext_master.dataIdSection,
        AppContext_master.dataSectionSharing,
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataPretest,
        AppContext_master.dataQuizPretest,
        AppContext_master.dataPostTest,
        AppContext_master.dataQuizPostTest,
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    } else if (steps.length == 5 && sharingExpertIndex === 3) {
      onChangePage(
        "forumBefore",
        AppContext_master.MateriForm,
        (AppContext_master.count += 1),
        AppContext_master.dataIdSection,
        AppContext_master.dataSectionSharing,
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataPretest,
        AppContext_master.dataQuizPretest,
        AppContext_master.dataPostTest,
        AppContext_master.dataQuizPostTest,
        AppContext_test.ForumForm,
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    } else if (steps.length == 5 && sharingExpertIndex === 4) {
      onChangePage(
        steps[3],
        AppContext_master.MateriForm,
        (AppContext_master.count += 1),
        AppContext_master.dataIdSection,
        AppContext_master.dataSectionSharing,
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataPretest,
        AppContext_master.dataQuizPretest,
        AppContext_master.dataPostTest,
        AppContext_master.dataQuizPostTest,
        AppContext_test.ForumForm,
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    }
    if (steps.length === 6 && sharingExpertIndex == 3) {
      onChangePage(
        "forumBefore",
        AppContext_master.Materi,
        AppContext_master.dataIdSection,
        AppContext_master.dataSectionSharing,
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataPretest,
        AppContext_master.dataQuizPretest,
        AppContext_master.dataPostTest,
        AppContext_master.dataQuizPostTest,
        AppContext_test.ForumForm,
        (AppContext_master.count += 1),
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    }

    if (steps.length === 6 && sharingExpertIndex == 4) {
      onChangePage(
        steps[3],
        AppContext_master.Materi,
        AppContext_master.dataIdSection,
        AppContext_master.dataSectionSharing,
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataPretest,
        AppContext_master.dataQuizPretest,
        AppContext_master.dataPostTest,
        AppContext_master.dataQuizPostTest,
        AppContext_test.ForumForm,
        (AppContext_master.count += 1),
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    } else if (steps.length == 6 && sharingExpertIndex == 5) {
      onChangePage(
        steps[4],
        AppContext_master.Materi,
        AppContext_master.dataIdSection,
        AppContext_master.dataSectionSharing,
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataPretest,
        AppContext_master.dataQuizPretest,
        AppContext_master.dataPostTest,
        AppContext_master.dataQuizPostTest,
        AppContext_test.ForumForm,
        (AppContext_master.count += 1),
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    }
  };

  const initialSteps = ["Pengenalan", "Materi", "Forum"];
  const additionalSteps = ["Sharing Expert", "Pre-Test", "Post-Test"];

  const handleStepAdded = (stepName) => {};

  const handleStepRemoved = (stepName) => {};

  const handleStepChange = (stepContent) => {
    onChangePage(stepContent);
  };

  const [stepCount, setStepCount] = useState(0);

  const handleStepCountChange = (count) => {
    setStepCount(count);
  };

  const [stepPage, setStepPage] = useState([]);
  const handleAllStepContents = (allSteps) => {
    setStepPage(allSteps);
  };

  if (isLoading) return <Loading />;

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
            Tambah Sharing Expert
          </h4>
        </div>
        <div className="ket-draft">
          <span className="badge text-bg-dark " style={{ fontSize: "16px" }}>
            Draft
          </span>
        </div>
      </div>
      <form onSubmit={handleAdd}>
        <div style={{ margin: "20px 100px" }}>
          <CustomStepper
            initialSteps={initialSteps}
            additionalSteps={additionalSteps}
            onChangeStep={sharingExpertIndex}
            onStepAdded={handleStepAdded}
            onStepRemoved={handleStepRemoved}
            onChangePage={handleStepChange}
            onStepCountChanged={handleStepCountChange}
            onAllStepContents={handleAllStepContents}
          />
        </div>
        <div className="card mt-4" style={{ margin: "100px" }}>
          <div className="card-body p-4">
            <div className="row">
              <div className="">
                <FileUpload
                  ref={fileInputRef}
                  forInput="mat_sharing_expert_pdf"
                  label="File Sharing Expert (.pdf,.docx,.xlsx,.pptx,.mp4)"
                  formatFile=".pdf,.docx,.xlsx,.pptx,.mp4"
                  onChange={() =>
                    handlePdfChange(fileInputRef, "pdf,docx,xlsx,pptx")
                  }
                  errorMessage={errors.mat_sharing_expert_pdf}
                  style={{ maxWidth: "100%" }}
                />
                {AppContext_test.sharingExpertPDF && (
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      previewFile(AppContext_test.sharingExpertPDF);
                    }}
                    style={{ textDecoration: "none" }}
                  >
                    Lihat berkas yang telah diunggah
                  </a>
                )}
              </div>
              <div className="">
                <FileUpload
                  ref={vidioInputRef}
                  forInput="mat_sharing_expert_video"
                  label="Video Sharing Expert (.mp4, .mov)"
                  formatFile=".mp4,.mov"
                  maxFileSize={250}
                  onChange={() => handleVideoChange(vidioInputRef, "mp4,mov")}
                  errorMessage={errors.mat_sharing_expert_video}
                  style={{ maxWidth: "100%" }}
                />
                {AppContext_test.sharingExpertVideo && (
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      previewFile(AppContext_test.sharingExpertVideo);
                    }}
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
                onClick={handleSebelumnya}
              />
            </div>
            <div className="d-flex mr-4">
              <Button
                classType="primary ms-2 px-4 py-2"
                type="submit"
                label={
                  (steps.length === 4 && sharingExpertIndex === 3) ||
                  (steps.length === 5 && sharingExpertIndex === 4) ||
                  (steps.length === 6 && sharingExpertIndex === 5)
                    ? "Simpan"
                    : "Berikutnya"
                }
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
