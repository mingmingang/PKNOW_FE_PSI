import { useRef, useState, useEffect } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../../util/Constants";
import {
  validateAllInputs,
  validateInput,
} from "../../../../util/ValidateForm";
import UseFetch from "../../../../util/UseFetch";
import Button from "../../../../part/Button copy";
import Input from "../../../../part/Input";
import FileUpload from "../../../../part/FileUpload";
import UploadFile from "../../../../util/UploadFile";
import Alert from "../../../../part/Alert";
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
import BackPage from "../../../../../assets/backPage.png";
import Konfirmasi from "../../../../part/Konfirmasi";
import NoImage from "../../../../../assets/NoImage.png";
import CustomStepper from "../../../../part/Stepp";
import { decode } from "he";
import Editor from "../../../../part/CKEditor";

export default function Pengenalan({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKategori, setListKategori] = useState([]);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fileGambarRef = useRef(null);

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

  const kategori = AppContext_master.KategoriIdByKK;

  const formDataRef = useRef({
    kat_id: AppContext_master.KategoriIdByKK,
    mat_judul: "",
    mat_file_pdf: "",
    mat_file_video: "",
    mat_pengenalan: "",
    mat_keterangan: "",
    kry_id: AppContext_test.karyawanId,
    mat_kata_kunci: "",
    mat_gambar: "",
    createdby: AppContext_test.activeUser,
  });

  const userSchema = object({
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
    createdby: string(),
  });

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    if (name === "mat_pengenalan") {
      const textOnly = value.replace(/<\/?[^>]+(>|$)/g, "");
      formDataRef.current[name] = textOnly;
    } else {
      formDataRef.current[name] = value;
    }

    try {
      if (name === "personInCharge" && value === "") {
        setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
      } else {
        await userSchema.validateAt(name, { [name]: value });
        setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
      }
    } catch (error) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: error.message }));
    }

    formDataRef.current[name] = value;
  };

  const [filePreview, setFilePreview] = useState(false);

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
          UploadFile(fileGambarRef.current).then(
            (data) => (formDataRef.current["mat_gambar"] = data.Hasil)
          )
        );
      }

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "Materi/SaveDataMateri",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Gagal menyimpan data Materi");
        }

        if (data && data.length > 0 && data[0].hasil === "OK") {
          AppContext_master.dataIDMateri = data[0].newID;
          setIsFormDisabled(false);
          AppContext_master.formSavedMateri = true;
          onChangePage(
            "materiAdd",
            (AppContext_master.MateriForm = formDataRef.current),
            (AppContext_master.count += 1),
            AppContext_master.dataIDMateri,
            AppContext_test.ForumForm,
            AppContext_master.dataIdSection,
            AppContext_master.dataSectionSharing,
            AppContext_master.dataIdSectionSharing,
            AppContext_master.dataIdSectionPretest,
            AppContext_master.dataIdSectionPostTest,
            AppContext_master.dataPretest,
            AppContext_master.dataQuizPretest,
            AppContext_master.dataPostTest,
            AppContext_master.dataQuizPostTest,
            AppContext_master.dataTimerPostTest
          );
        } else {
          throw new Error("Response tidak valid dari server");
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: "Terjadi kesalahan: " + error.message,
        }));
      } finally {
        setIsLoading(false);
      }
    } else {
      window.scrollTo(0, 0);
    }
  };

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

  useEffect(() => {
    if (
      AppContext_master.MateriForm &&
      AppContext_master.MateriForm.current &&
      Object.keys(AppContext_master.MateriForm.current).length > 0
    ) {
      formDataRef.current = {
        ...formDataRef.current,
        ...AppContext_master.MateriForm.current,
      };
    }

    if (AppContext_master.formSavedMateri === false) {
      setIsFormDisabled(false);
    }
  }, [AppContext_master.MateriForm, AppContext_master.formSavedMateri]);

  const dataSaved = AppContext_master.formSavedMateri;

  const handleStepChange = (stepContent) => {
    onChangePage(stepContent);
  };

  const initialSteps = ["Pengenalan", "Materi", "Forum"];
  const additionalSteps = ["Sharing Expert", "Pre-Test", "Post-Test"];

  const handleStepChanges = (index) => {};

  const handleStepAdded = (stepName) => {};

  const handleStepRemoved = (stepName) => {};

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
            onChangeStep={handleStepChanges}
            onStepAdded={handleStepAdded}
            onStepRemoved={handleStepRemoved}
            onChangePage={handleStepChange}
          />
        </div>

        <div className="card mb-4">
          <div className="col-lg-4 mt-4" style={{ display: "flex" }}>
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
                    src={NoImage}
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
            <div className="file-upload">
              <FileUpload
                forInput="gambarMateri"
                label="Gambar Materi (.jpg, .png)"
                formatFile=".jpg,.png"
                ref={fileGambarRef}
                onChange={() => handleFileChange(fileGambarRef, "png,jpg")}
                errorMessage={errors.gambar}
                isRequired={true}
              />
            </div>
          </div>
          <div className="card-body pl-4 pr-4">
            <div className="row">
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="namaKK"
                  label="Kelompok Keahlian"
                  value={decode(
                    listKategori.find(
                      (item) => item.value === formDataRef.current.kat_id
                    )?.namaKK || ""
                  )}
                  disabled
                  errorMessage={errors.namaKK}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="kat_id"
                  label="Kategori Program"
                  value={decode(
                    listKategori.find(
                      (item) => item.value === formDataRef.current.kat_id
                    )?.label || ""
                  )}
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
                  value={formDataRef.current.mat_judul}
                  onChange={handleInputChange}
                  errorMessage={errors.mat_judul}
                  isRequired
                  disabled={isFormDisabled || dataSaved}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="mat_kata_kunci"
                  label="Kata Kunci Materi"
                  placeholder="Kata Kunci Materi"
                  value={formDataRef.current.mat_kata_kunci}
                  onChange={handleInputChange}
                  errorMessage={errors.mat_kata_kunci}
                  isRequired
                  disabled={isFormDisabled || dataSaved}
                />
              </div>
              <div className="col-lg-12">
                <Input
                  type="textarea"
                  forInput="mat_keterangan"
                  label="Keterangan Materi"
                  isRequired
                  value={formDataRef.current.mat_keterangan}
                  onChange={handleInputChange}
                  errorMessage={errors.mat_keterangan}
                  disabled={isFormDisabled || dataSaved}
                />
              </div>
              <div className="col-lg-12">
                <div className="form-group">
                  <label
                    htmlFor="pengenalanMateri"
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
                    disabled={isFormDisabled || dataSaved}
                  />

                  {errors.mat_pengenalan && (
                    <div className="invalid-feedback d-block">
                      {errors.mat_pengenalan}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-between my-4 mx-1 mt-0">
            <div className="ml-4"></div>
            <div className="d-flex mr-4">
              <Button
                classType="primary ms-2 px-4 py-2"
                type="submit"
                label="Berikutnya"
                isDisabled={isFormDisabled || dataSaved}
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
