import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import UploadFile from "../../../util/UploadFile";
import Select2Dropdown from "../../../part/Select2Dropdown";
import Input from "../../../part/Input";
import FileUpload from "../../../part/FileUpload";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import { API_LINK } from "../../../util/Constants";
import Label from "../../../part/Label";
import BackPage from "../../../../assets/backPage.png";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import Konfirmasi from "../../../part/Konfirmasi";
import AppContext_test from "../../master-test/TestContext";
import { decode } from "he";
import AnimatedSection from "../../../part/AnimatedSection";
import "../../../../index.css";

export default function MasterDaftarPustakaEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKK, setListKK] = useState([]);
  const [fileExtension, setFileExtension] = useState("");
  const [file, setFile] = useState("");
  const [isBackAction, setIsBackAction] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
    pus_id: withID.Key,
    pus_judul: decode(withID.Judul),
    kke_id: withID.kke_id,
    pus_file: "",
    pus_keterangan: decode(withID.Keterangan),
    pus_kata_kunci: withID["Kata Kunci"],
    pus_gambar: "",
    pus_status: "Aktif",
  });

  const userSchema = object({
    pus_id: string(),
    pus_judul: string().required("Isi Judul Terlebih Dahulu"),
    kke_id: string().required("Pilih Terlebih Dahulu"),
    pus_file: string(),
    pus_keterangan: string().required("Isi Keterangan Terlebih Dahulu"),
    pus_kata_kunci: string().required("Isi Kata Kunci Terlebih Dahulu"),
    pus_gambar: string(),
    pus_status: string(),
  });

  const resetForm = () => {
    formDataRef.current = {
      pus_id: withID.Key,
      pus_judul: decode(withID.Judul),
      kke_id: withID["ID KK"],
      pus_file: "",
      pus_keterangan: decode(withID.Keterangan),
      pus_kata_kunci: withID["Kata Kunci"],
      pus_gambar: "",
      pus_status: "Aktif",
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

  useEffect(() => {
    if (fileExtension === "mp4") {
      AppContext_test.urlMateri = withID.File;
    } else {
      fetch(
        API_LINK +
          `Upload/DownloadFile?namaFile=${encodeURIComponent(withID.File)}`
      )
        .then((response) => response.blob())
        .then((blob) => {
          URL.createObjectURL(blob);
          setFile(`${API_LINK}Upload/GetFile/${withID.File}`);
        })
        .catch((error) => {});
    }
  }, [fileExtension]);

  useEffect(() => {
    const fetchDataKK = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));
      try {
        const data = await UseFetch(API_LINK + "KK/GetDataKKAll", {
          page: "",
          query: "",
          sort: "[Nama Kelompok Keahlian] asc",
          status: "Aktif",
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar prodi.");
        } else {
          const formattedData = data.map((item) => ({
            Value: item["Key"],
            Text: decode(item["Nama Kelompok Keahlian"]),
          }));
          setListKK(formattedData);

          const matchingItem = formattedData.find(
            (item) => item.Value === withID["ID KK"]
          );
          if (matchingItem) {
            formDataRef.current.kke_id = matchingItem.Value;
          }
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
        setListKK([]);
      }
    };

    fetchDataKK();
  }, [withID]);

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

      if (fileDocumentRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fileDocumentRef.current).then(
            (data) => (formDataRef.current["pus_file"] = data.Hasil)
          )
        );
      } else {
        formDataRef.current["pus_file"] = "";
      }

      if (fileGambarRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fileGambarRef.current).then(
            (data) => (formDataRef.current["pus_gambar"] = data.Hasil)
          )
        );
      } else {
        formDataRef.current["pus_gambar"] = "";
      }

      Promise.all(uploadPromises).then(() => {
        UseFetch(API_LINK + "Pustaka/UpdateDataPustaka", formDataRef.current)
          .then((data) => {
            if (data === "ERROR") {
              setIsError((prevError) => {
                return {
                  ...prevError,
                  error: true,
                  message: "Terjadi kesalahan: Gagal menyimpan data Pustaka.",
                };
              });
            } else {
              SweetAlert("Sukses", "Data Pustaka berhasil disimpan", "success");
              window.location.reload();
            }
          })
          .then(() => setIsLoading(false));
      });
    }
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <AnimatedSection>
        {isError.error && (
          <div className="flex-fill">
            <Alert type="danger" message={isError.message} />
          </div>
        )}
        <div
          className="container mb-4"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "100px",
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
              Edit Knowledge Database
            </h4>
          </div>
        </div>
        <form onSubmit={handleAdd}>
          <div className="container mb-4">
            <div className="card">
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-lg-4 box-image">
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
                              src={`${API_LINK}Upload/GetFile/${withID.Gambar}`}
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
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4">
                    <Input
                      type="text"
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
                    />
                  </div>
                  <div className="col-lg-4">
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
                    />
                  </div>

                  <Label
                    title={"File Pustaka Sebelumnya"}
                    data={
                      file ? (
                        <a
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none" }}
                        >
                          Tampilkan Berkas
                        </a>
                      ) : (
                        "Tidak ada lampiran"
                      )
                    }
                  />

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
