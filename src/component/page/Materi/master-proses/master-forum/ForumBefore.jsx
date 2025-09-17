import { useState, useEffect } from "react";
import { object, string } from "yup";
import {
  validateAllInputs,
  validateInput,
} from "../../../../util/ValidateForm";
import Button from "../../../../part/Button copy";
import Input from "../../../../part/Input";
import Alert from "../../../../part/Alert";
import UseFetch from "../../../../util/UseFetch";
import { API_LINK } from "../../../../util/Constants";
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
import Editor from "../../../../part/CKEditor";
import BackPage from "../../../../../assets/backPage.png";
import Konfirmasi from "../../../../part/Konfirmasi";
import CustomStepper from "../../../../part/Stepp";

const userSchema = object({
  forumJudul: string()
    .max(100, "maksimum 100 karakter")
    .required("harus diisi"),
  forumIsi: string().required("harus diisi"),
});

export default function MasterForumBefore({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    materiId: AppContext_master.dataIDMateri,
    forumJudul: AppContext_test.ForumForm?.forumJudul || "",
    forumIsi: AppContext_test.ForumForm?.forumIsi || "",
    karyawanId: AppContext_test.activeUser,
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

  const [resetStepper, setResetStepper] = useState(0);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  useEffect(() => {
    setResetStepper((prev) => !prev + 1);
  });

  const storedSteps = sessionStorage.getItem("steps");
  const steps = storedSteps ? JSON.parse(storedSteps) : initialSteps;

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
    }

    try {
      const response = await UseFetch(
        API_LINK + "Forum/EditDataForum",
        formData
      );
      if (response === "ERROR") {
        setIsError({
          error: true,
          message: "Terjadi kesalahan: Gagal menyimpan data Sharing.",
        });
      } else {
        if (steps.length == 3) {
          setIsFormDisabled(false);
          setResetStepper((prev) => !prev + 1);
          AppContext_test.formSavedForum = true;
          setResetStepper((prev) => !prev + 1);
          window.location.reload();
        } else {
          setIsFormDisabled(false);
          setResetStepper((prev) => !prev + 1);
          AppContext_test.formSavedForum = true;
          setResetStepper((prev) => !prev + 1);
          onChangePage(
            steps[3],
            (AppContext_test.ForumForm = formData),
            AppContext_master.Materi,
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
        }
      }
    } catch (error) {
      setIsError({
        error: true,
        message: "Failed to save forum data: " + error.message,
      });
      setIsLoading(false);
    }
  };

  const initialSteps = ["Pengenalan", "Materi", "Forum"];
  const additionalSteps = ["Sharing Expert", "Pre-Test", "Post-Test"];

  const handleStepAdded = (stepName) => {};

  const handleStepRemoved = (stepName) => {};

  const handleStepChange = (stepContent) => {
    onChangePage(stepContent);
  };

  const [stepPage, setStepPage] = useState([]);
  const handleAllStepContents = (allSteps) => {
    setStepPage(allSteps);
  };

  const [stepCount, setStepCount] = useState(0);

  const handleStepCountChange = (count) => {
    setStepCount(count);
  };

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
            Tambah Forum
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
            onChangeStep={2}
            onStepAdded={handleStepAdded}
            onStepRemoved={handleStepRemoved}
            onChangePage={handleStepChange}
            onStepCountChanged={handleStepCountChange}
            onAllStepContents={handleAllStepContents}
          />
        </div>
        <div className="card mb-4">
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-12">
                <Input
                  type="text"
                  forInput="forumJudul"
                  label="Judul Forum"
                  value={formData.forumJudul}
                  onChange={handleInputChange}
                  errorMessage={errors.forumJudul}
                  isRequired
                  disabled={isFormDisabled}
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
          <div className="d-flex justify-content-between my-4 mx-1 mt-0">
            <div className="ml-4">
              <Button
                classType="outline-secondary me-2 px-4 py-2"
                label="Sebelumnya"
                onClick={() =>
                  onChangePage(
                    "materiAdd",
                    (AppContext_test.ForumForm = formData),
                    AppContext_master.Materi,
                    AppContext_master.dataIdSection,
                    AppContext_master.dataSectionSharing,
                    AppContext_master.dataIdSectionSharing,
                    AppContext_master.dataIdSectionPretest,
                    AppContext_master.dataPretest,
                    AppContext_master.dataQuizPretest,
                    AppContext_master.dataPostTest,
                    AppContext_master.dataQuizPostTest,
                    AppContext_master.dataTimerQuizPreTest,
                    AppContext_master.MateriForm,
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
                disabled={false}
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
