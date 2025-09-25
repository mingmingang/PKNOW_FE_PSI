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
import AppContext_master from "../MasterContext";
import AppContext_test from "../../../master-test/TestContext";
import uploadFile from "../../../../util/UploadFile";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import Konfirmasi from "../../../../part/Konfirmasi";
import BackPage from "../../../../../assets/backPage.png";
import Cookies from "js-cookie";
import { decryptId } from "../../../../util/Encryptor";

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

export default function MasterSharingEditNot({ onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const fileInputRef = useRef(null);
  const vidioInputRef = useRef(null);

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
            Authorization: "Bearer " + Cookies.get("jwtToken"),
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

  const formDataRef = useRef({
    mat_id: AppContext_master.MateriForm?.Key || "",
    mat_sharing_expert_pdf: "",
    mat_sharing_expert_video: "",
  });

  const userSchema = object({
    mat_id: string().required("ID Materi tidak boleh kosong"),
    mat_sharing_expert_pdf: string(),
    mat_sharing_expert_video: string(),
  });

  const handlePdfChange = () => handleFileChange(fileInputRef, "pdf", 10);
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

  const [dataSection, setDataSection] = useState({
    materiId: AppContext_master.MateriForm?.Key || "",
    secJudul: "Section Materi " + AppContext_master.MateriForm?.Key || "",
    createdby: activeUser,
    secType: "Sharing Expert",
  });

  async function fetchSectionData() {
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    try {
      const data = await UseFetch(
        API_LINK + "Section/CreateSection",
        dataSection
      );

      if (data === "ERROR" || !data || data[0]?.hasil !== "OK") {
        setIsError({
          error: true,
          message: "Terjadi kesalahan: Gagal menyimpan data Materi.",
        });
        return;
      }

      const idSection = data[0].newID;
      AppContext_master.formSavedMateri = true;

      const isPdfEmpty = !fileInputRef.current?.files.length;
      const isVideoEmpty = !vidioInputRef.current?.files.length;

      if (isPdfEmpty && isVideoEmpty) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          mat_sharing_expert_pdf: "Pilih salah satu antara PDF atau Video",
          mat_sharing_expert_video: "Pilih salah satu antara PDF atau Video",
        }));
        return;
      }

      if (
        Object.values(validationErrors).every((error) => !error) &&
        (!isPdfEmpty || !isVideoEmpty)
      ) {
        setIsLoading(true);
        setIsError({ error: false, message: "" });
        setErrors({});

        const uploadPromises = [];

        if (fileInputRef.current?.files.length > 0) {
          uploadPromises.push(
            uploadFile(fileInputRef.current).then((data) => {
              formDataRef.current.mat_sharing_expert_pdf = data.Hasil;
              AppContext_test.sharingExpertPDF = data.Hasil;
            })
          );
        }

        if (vidioInputRef.current?.files.length > 0) {
          uploadPromises.push(
            uploadFile(vidioInputRef.current).then((data) => {
              formDataRef.current.mat_sharing_expert_video = data.Hasil;
              AppContext_test.sharingExpertVideo = data.Hasil;
            })
          );
        }

        try {
          await Promise.all(uploadPromises);

          const finalData = await UseFetch(
            API_LINK + "SharingExpert/UpdateDataSharing",
            {
              p1: idSection,
              p2: formDataRef.current.mat_sharing_expert_pdf,
              p3: formDataRef.current.mat_sharing_expert_video,
              p4: activeUser,
            }
          );

          if (finalData === "ERROR" || !finalData) {
            throw new Error("Gagal untuk menyimpan data Sharing Expert");
          } else {
            SweetAlert(
              "Berhasil",
              "Data Sharing Expert berhasil diubah!",
              "success"
            );
          }
        } catch (error) {
          setIsError({
            error: true,
            message: "Terjadi kesalahan: " + error.message,
          });
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      setIsError({
        error: true,
        message: "Terjadi kesalahan: " + error.message,
      });
      setIsLoading(false);
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault();
    fetchSectionData();
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

  const handlePageChange = (content) => {
    onChangePage(content);
  };

  if (isLoading) return <Loading />;

  return (
    <>
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
      </div>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd} style={{ marginBottom: "20px" }}>
        <div className="mb-4">
          <CustomStepper
            activeStep={3}
            steps={steps}
            onChangePage={handlePageChange}
            getStepContent={getStepContent}
          />
        </div>
        <div className="card" style={{ margin: "0px 80px" }}>
          <div className="card-header bg-outline-primary fw-medium text-black">
            Tambah Sharing Expert
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <FileUpload
                  ref={fileInputRef}
                  forInput="mat_sharing_expert_pdf"
                  label="File Sharing Expert (.pdf)"
                  formatFile=".pdf"
                  onChange={() => handlePdfChange(fileInputRef, "pdf")}
                  errorMessage={errors.mat_sharing_expert_pdf}
                />
                {AppContext_test.sharingExpertPDF && (
                  <a
                    style={{ textDecoration: "none" }}
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      previewFile(
                        AppContext_test.sharingExpertPDF,
                        "application/pdf"
                      );
                    }}
                  >
                    Lihat berkas yang telah diunggah
                  </a>
                )}
              </div>
              <div className="col-lg-6">
                <FileUpload
                  ref={vidioInputRef}
                  forInput="mat_sharing_expert_video"
                  label="Video Sharing Expert (.mp4, .mov)"
                  formatFile=".mp4,.mov"
                  maxFileSize={250}
                  onChange={() => handleVideoChange(vidioInputRef, "mp4,mov")}
                  errorMessage={errors.mat_sharing_expert_video}
                />
                {AppContext_test.sharingExpertVideo && (
                  <a
                    style={{ textDecoration: "none" }}
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      previewFile(
                        AppContext_test.sharingExpertVideo,
                        "video/mp4"
                      );
                    }}
                  >
                    Lihat berkas yang telah diunggah
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="d-flex ml-4 mb-4 justify-content-between">
            <Button
              classType="outline-secondary me-2 px-4 py-2"
              label="Sebelumnya"
              onClick={() =>
                onChangePage(
                  "forumEdit",
                  AppContext_test.ForumForm,
                  AppContext_test.MateriForm,
                  (AppContext_master.count += 1)
                )
              }
            />
            <div className="d-flex">
              <div className="mr-2">
                <Button
                  classType="primary ms-2 px-4 py-2"
                  type="submit"
                  label="Simpan"
                />
                <Button
                  classType="primary px-4 py-2 ml-4 mr-4"
                  label="Berikutnya"
                  onClick={() =>
                    onChangePage(
                      "pretestEdit",
                      AppContext_test.ForumForm,
                      AppContext_master.MateriForm
                    )
                  }
                />
              </div>
            </div>
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
