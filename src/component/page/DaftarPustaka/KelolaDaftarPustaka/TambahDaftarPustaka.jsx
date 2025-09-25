import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../util/Constants";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import Select2Dropdown from "../../../part/Select2Dropdown";
import Input from "../../../part/Input";
import FileUpload from "../../../part/FileUpload";
import Alert from "../../../part/Alert";
import UploadFile from "../../../util/UploadFile";
import NoImage from "../../../../assets/NoImage.png";
import BackPage from "../../../../assets/backPage.png";
import Konfirmasi from "../../../part/Konfirmasi";
import { decode } from "he";
import AnimatedSection from "../../../part/AnimatedSection";
import "../../../../index.css";

export default function MasterDaftarPustakaAdd({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKK, setListKK] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);

  const deskripsiRef = useRef(null);

  const handleGoBack = () => {
    setIsBackAction(true);
    setShowConfirmation(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmation(false);
    onChangePage("index", withID);
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };

  const [filePreview, setFilePreview] = useState(false);
  const fileGambarRef = useRef(null);
  const fileDocumentRef = useRef(null);

  const formDataRef = useRef({
    kke_id: withID,
    pus_file: "",
    pus_judul: "",
    pus_keterangan: "",
    pus_kata_kunci: "",
    pus_gambar: "",
    pus_status: "Aktif",
  });

  const userSchema = object({
    kke_id: string().required("Pilih Terlebih Dahulu"),
    pus_file: string().required("Pilih File Pustaka Terlebih Dahulu"),
    pus_judul: string()
      .max(30, "Maksimal 30 Karakter")
      .required("Isi Judul Terlebih Dahulu"),
    pus_kata_kunci: string().required("Isi Kata Kunci Terlebih Dahulu"),
    pus_keterangan: string()
      .required("Isi Keterangan Terlebih Dahulu")
      .min(100, "Minimum 100 Karakter"),
    pus_gambar: string(),
    pus_status: string(),
  });

  const resetForm = () => {
    formDataRef.current = {
      pus_file: "",
      pus_judul: "",
      pus_keterangan: "",
      pus_kata_kunci: "",
      pus_gambar: "",
      pus_status: "Aktif",
      kke_id: "",
    };
    setFilePreview(false);
    setErrors({});
    if (fileGambarRef.current) {
      fileGambarRef.current.value = null;
    }
    if (fileDocumentRef.current) {
      fileDocumentRef.current.value = null;
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name === "deskripsi") {
      const cursorPosition = deskripsiRef.current.selectionStart;

      try {
        if (value === "") {
          setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
        } else {
          await userSchema.validateAt(name, { [name]: value });
          setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
        }
      } catch (error) {
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error.message }));
      }

      formDataRef.current[name] = value;

      setTimeout(() => {
        if (deskripsiRef.current) {
          deskripsiRef.current.setSelectionRange(
            cursorPosition,
            cursorPosition
          );
        }
      }, 0);
    }

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

  const handleDocumentChange = async (ref, extAllowed, maxFileSize) => {
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

    formDataRef.current[name] = fileName;

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
      setIsError((prevError) => {
        return { ...prevError, error: false };
      });
      setErrors({});
      const uploadPromises = [];

      if (fileGambarRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fileGambarRef.current).then(
            (data) => (formDataRef.current["pus_gambar"] = data.Hasil)
          )
        );
      }

      if (fileDocumentRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fileDocumentRef.current).then((data) => {
            if (data.Hasil) {
              formDataRef.current["pus_file"] = data.Hasil;
            } else {
              throw new Error("Upload file gagal");
            }
          })
        );
      }

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "Pustaka/SaveDataPustaka",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data.");
        } else {
          SweetAlert(
            "Sukses",
            "Data Daftar Pustaka berhasil disimpan",
            "success"
          );
          onChangePage("index");
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

  const getListKK = async () => {
    try {
      while (true) {
        let data = await UseFetch(API_LINK + "KK/GetDataKKAll", {
          page: "",
          query: "",
          sort: "[Nama Kelompok Keahlian] asc",
          status: "Aktif",
        });

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian."
          );
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else if (data === "data kosong") {
          setListKK(data);
          break;
        } else {
          const formattedData = data.map((item) => ({
            Value: item["Key"],
            Text: decode(item["Nama Kelompok Keahlian"]),
          }));
          setListKK(formattedData);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  useEffect(() => {
    getListKK();
  }, []);

  return (
    <>
      <AnimatedSection>
        {isError.error && (
          <div className="flex-fill">
            <Alert type="danger" message={isError.message} />
          </div>
        )}
        <div
          className="container mb-3"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "100px",
          }}
        >
          <div style={{ display: "flex" }}>
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
              Tambah Knowledge Database
            </h4>
          </div>
          <div className="ket-draft">
            <span className="badge text-bg-dark " style={{ fontSize: "16px" }}>
              Draft
            </span>
          </div>
        </div>
        <form onSubmit={handleAdd}>
          <div className="container mb-4">
            <div className="card">
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-lg-6 box-image">
                    <div className="file-preview">
                      <div className="preview-img">
                        {filePreview ? (
                          <div
                            style={{
                              marginTop: "10px",
                              marginRight: "30px",
                              marginBottom: "20px",
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
                              marginBottom: "20px",
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
                    </div>
                    <div className="fileupload">
                      <FileUpload
                        forInput="gambarInputref"
                        label="Gambar Daftar Pustaka (.jpg/.png)"
                        formatFile=".png, .jpg"
                        ref={fileGambarRef}
                        onChange={() =>
                          handleFileChange(fileGambarRef, "png,jpg")
                        }
                        errorMessage={errors.pus_gambar}
                        isRequired={true}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4">
                    <Input
                      type="text"
                      placeholder="Masukan Judul Pustaka"
                      forInput="pus_judul"
                      label="Judul / Nama File Pustaka"
                      isRequired
                      value={formDataRef.current.pus_judul}
                      onChange={handleInputChange}
                      errorMessage={errors.pus_judul}
                    />
                  </div>
                  <div className="col-lg-4">
                    <Select2Dropdown
                      forInput="kke_id"
                      label="Kelompok Keahlian"
                      arrData={listKK}
                      isRequired
                      value={formDataRef.current.kke_id}
                      onChange={handleInputChange}
                      errorMessage={errors.kke_id}
                    />
                  </div>
                  <div className="col-lg-4">
                    <Input
                      type="text"
                      forInput="pus_kata_kunci"
                      label="Kata Kunci"
                      isRequired
                      value={formDataRef.current.pus_kata_kunci}
                      onChange={handleInputChange}
                      errorMessage={errors.pus_kata_kunci}
                      placeholder="Masukan Kata Kunci"
                    />
                  </div>
                  <div className="mb-2">
                    <FileUpload
                      ref={fileDocumentRef}
                      forInput="pus_file"
                      maxFileSize="250"
                      label="File Pustaka (.pdf, .docx, .xlsx, .pptx, .mp4)"
                      formatFile=".pdf,.docx,.xlsx,.pptx,.mp4"
                      onChange={() =>
                        handleDocumentChange(
                          fileDocumentRef,
                          "pdf,docx,xlsx,pptx,mp4",
                          250
                        )
                      }
                      errorMessage={errors.pus_file}
                      isRequired
                    />
                  </div>

                  <div className="col-lg-12">
                    <Input
                      type="textarea"
                      forInput="pus_keterangan"
                      label="Sinopsis / Ringkasan Pustaka"
                      isRequired
                      value={formDataRef.current.pus_keterangan}
                      onChange={handleInputChange}
                      errorMessage={errors.pus_keterangan}
                    />
                  </div>
                </div>
              </div>

              <div
                className="d-flex justify-content-end"
                style={{
                  marginRight: "20px",
                  marginTop: "-10px",
                  marginBottom: "20px",
                }}
              >
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  onClick={resetForm}
                  style={{
                    marginRight: "10px",
                    padding: "5px 15px",
                    fontWeight: "bold",
                    borderRadius: "10px",
                  }}
                >
                  Batalkan
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  type="submit"
                  style={{
                    marginRight: "10px",
                    padding: "5px 20px",
                    fontWeight: "bold",
                    borderRadius: "10px",
                  }}
                >
                  Simpan
                </button>
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
      </AnimatedSection>
    </>
  );
}
