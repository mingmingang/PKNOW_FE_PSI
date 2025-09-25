import { useState, useEffect } from "react";
import { object, string } from "yup";
import { validateAllInputs } from "../../../../util/ValidateForm";
import SweetAlert from "../../../../util/SweetAlert";
import Button from "../../../../part/Button copy";
import Input from "../../../../part/Input";
import Loading from "../../../../part/Loading";
import Alert from "../../../../part/Alert";
import { API_LINK } from "../../../../util/Constants";
import UseFetch from "../../../../util/UseFetch";
import Editor from "../../../../part/CKEditor";
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import BackPage from "../../../../../assets/backPage.png";
import Konfirmasi from "../../../../part/Konfirmasi";
import Cookies from "js-cookie";
import { decryptId } from "../../../../util/Encryptor";
import { decode } from "he";

const userSchema = object({
  forumJudul: string()
    .max(100, "Maksimum 100 karakter")
    .required("Harus diisi"),
  forumIsi: string().required("Harus diisi"),
});

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

export default function MasterForumEdit({ onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    forumJudul: "",
    forumIsi: "",
  });
  const [forumDataExists, setForumDataExists] = useState(false);
  const Materi = AppContext_master.MateriForm;
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
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

  const stripHTMLTags = (htmlContent) => {
    const doc = new DOMParser().parseFromString(htmlContent, "text/html");
    return doc.body.textContent || "";
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const data = await UseFetch(API_LINK + "Forum/GetDataForumByMateri", {
          p1: Materi.Key,
        });
        if (data === "ERROR") {
          setIsError(true);
        } else {
          if (data.length > 0) {
            setFormData({
              forumJudul: data[0]["Nama Forum"] || "",
              forumIsi: stripHTMLTags(data[0]["Isi Forum"]) || "",
            });
            setForumDataExists(true);
          } else {
            setForumDataExists(false);
          }
        }
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [Materi]);

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formData,
      userSchema,
      setErrors
    );
    const isEmptyData = Object.values(formData).some((value) => value === "");

    if (isEmptyData) {
      setIsError({
        error: true,
        message: "Data tidak boleh kosong",
      });
      return;
    }

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});
    } else {
      return;
    }

    try {
      const response = await UseFetch(API_LINK + "Forum/EditDataForum", {
        p1: Materi.Key,
        p2: formData.forumJudul,
        p3: formData.forumIsi,
        p4: activeUser,
      });

      if (response !== "ERROR") {
        SweetAlert("Berhasil", "Data forum berhasil diubah!", "success");
      } else {
        throw new Error(
          "Gagal menyimpan data forum. Respons dari server tidak valid."
        );
      }
    } catch (error) {
      setIsError({
        error: true,
        message: error.message || "Terjadi kesalahan saat menyimpan data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  const handlePageChange = (content) => {
    onChangePage(content);
  };

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
            Edit Forum
          </h4>
        </div>
      </div>
      <form onSubmit={handleAdd} style={{ margin: "20px 100px" }}>
        <div>
          <div className="mb-4">
            <CustomStepper
              activeStep={2}
              steps={steps}
              onChangePage={handlePageChange}
              getStepContent={getStepContent}
            />
          </div>
        </div>

        <div className="card mt-0">
          {isLoading && (
            <div className="card-body">
              <Loading />
            </div>
          )}

          {!isLoading && !forumDataExists && (
            <div className="card-body">
              <Alert
                type="warning"
                message={
                  <span>
                    Data Forum belum ditambahkan.{" "}
                    <a
                      onClick={() => onChangePage("forumEditNot")}
                      className="text-primary"
                    >
                      Tambah Data
                    </a>
                  </span>
                }
              />
            </div>
          )}

          {!isLoading && forumDataExists && (
            <div className="card-body p-4">
              <div className="row">
                <div className="col-lg-12">
                  <Input
                    type="text"
                    forInput="forumJudul"
                    label="Judul Forum"
                    value={formData && formData.forumJudul ? decode(formData.forumJudul) : ""}
                    placeholder="Judul tidak tersedia"
                    onChange={handleInputChange}
                    errorMessage={errors.forumJudul}
                    isRequired
                  />
                </div>
                <div className="col-lg-12">
                  <div className="form-group">
                    <label htmlFor="forumIsi" className="form-label fw-bold">
                      Isi Forum <span style={{ color: "Red" }}> *</span>
                    </label>
                    <Editor
                      value={formData.forumIsi}
                      onChange={(content) => {
                        handleInputChange({
                          target: {
                            name: "forumIsi",
                            value: content,
                          },
                        });
                      }}
                      disabled={isFormDisabled}
                    />

                    {errors.forumIsi && (
                      <div className="invalid-feedback d-block">
                        {errors.forumIsi}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="d-flex justify-content-between my-4 mx-1 mt-0">
            <div className="">
              <Button
                classType="outline-secondary ms-3 px-4 py-2"
                label="Sebelumnya"
                onClick={() =>
                  onChangePage(
                    "materiEdit",
                    AppContext_master.MateriForm,
                    (AppContext_master.count += 1)
                  )
                }
              />
            </div>
            <div className="d-flex mr-4">
              <Button
                classType="primary ms-2 px-4 py-2"
                type="submit"
                label="Edit"
                style={{ marginRight: "10px" }}
              />
              <Button
                classType="primary ms-3 px-4 py-2"
                label="Berikutnya"
                onClick={() =>
                  onChangePage(
                    "sharingEdit",
                    (AppContext_test.ForumForm = formData),
                    AppContext_master.MateriForm,
                    (AppContext_master.count += 1)
                  )
                }
              />
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
