import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../util/Constants";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import Loading from "../../../part/Loading";
import Select2Dropdown from "../../../part/Select2Dropdown";
import Input from "../../../part/Input";
import Alert from "../../../part/Alert";
import FileUpload from "../../../part/FileUpload";
import UploadFile from "../../../util/UploadFile";
import NoImage from "../../../../assets/NoImage.png";
import BackPage from "../../../../assets/backPage.png";
import Konfirmasi from "../../../part/Konfirmasi";

export default function ChangeProfile({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listProdi, setListProdi] = useState([]);
  const [listKaryawan, setListKaryawan] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);

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

  const fileGambarRef = useRef(null);

  const formDataRef = useRef({
    nama: "",
    programStudi: "",
    personInCharge: "",
    deskripsi: "",
    gambar: "",
  });

  const userSchema = object({
    nama: string().max(25, "maksimum 25 karakter").required("harus diisi"),
    programStudi: string().required("harus dipilih"),
    personInCharge: string(),
    deskripsi: string()
      .min(100, "minimum 100 karakter")
      .required("harus diisi"),
    gambar: string(),
  });

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

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

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

  const getListProdi = async () => {
    try {
      while (true) {
        let data = await UseFetch(API_LINK + "KK/GetListProdi", {});
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar prodi.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setListProdi(data);
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

  const getListKaryawan = async () => {
    try {
      let data = await UseFetch(API_LINK + "KK/GetListKaryawan", {
        idProdi: formDataRef.current.programStudi,
      });
      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil daftar karyawan.");
      } else {
        setListKaryawan(data);
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
    getListProdi();
  }, []);

  useEffect(() => {
    getListKaryawan();
  }, [formDataRef.current.programStudi]);

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
            (data) => (formDataRef.current["gambar"] = data.Hasil)
          )
        );
      }

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "KK/CreateKK",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data program.");
        } else {
          SweetAlert(
            "Sukses",
            "Data kelompok keahlian berhasil disimpan",
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

  const resetForm = () => {
    formDataRef.current = {
      nama: "",
      programStudi: "",
      personInCharge: "",
      deskripsi: "",
      gambar: "",
    };
    setFilePreview(false);
    setErrors({});
    if (fileGambarRef.current) {
      fileGambarRef.current.value = null;
    }
  };

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div
            className=""
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
                Tambah Kelompok Keahlian
              </h4>
            </div>
            <div className="ket-draft">
              <span
                className="badge text-bg-dark "
                style={{ fontSize: "16px" }}
              >
                Draft
              </span>
            </div>
          </div>
          <div className="" style={{ margin: "30px 70px" }}>
            <form onSubmit={handleAdd}>
              <div className="card">
                <div className="card-body p-4">
                  <div className="row">
                    <div className="col-lg-4" style={{ display: "flex" }}>
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
                      <div className="file-upload">
                        <FileUpload
                          forInput="gambarAlatMesin"
                          label="Gambar Kelompok Keahlian (.png)"
                          formatFile=".png"
                          ref={fileGambarRef}
                          onChange={() =>
                            handleFileChange(fileGambarRef, "png")
                          }
                          errorMessage={errors.gambar}
                          isRequired={true}
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <Input
                        type="text"
                        forInput="nama"
                        label="Nama Kelompok Keahlian"
                        isRequired
                        placeholder="Nama Kelompok Keahlian"
                        value={formDataRef.current.nama}
                        onChange={handleInputChange}
                        errorMessage={errors.nama}
                      />
                    </div>
                    <div className="col-lg-12">
                      <label
                        style={{ paddingBottom: "5px", fontWeight: "bold" }}
                      >
                        Deskripsi/Ringkasan Mengenai Kelompok Keahlian{" "}
                        <span style={{ color: "red" }}> *</span>
                      </label>
                      <Input
                        className="form-control mb-3"
                        style={{
                          height: "200px",
                        }}
                        type="textarea"
                        id="deskripsi"
                        name="deskripsi"
                        forInput="deskripsi"
                        value={formDataRef.current.deskripsi}
                        onChange={handleInputChange}
                        placeholder="Deskripsi/Ringkasan Mengenai Kelompok Keahlian"
                        isRequired
                        errorMessage={errors.deskripsi}
                      />
                    </div>

                    <div className="col-lg-6">
                      <Select2Dropdown
                        forInput="programStudi"
                        label="Program Studi"
                        arrData={listProdi}
                        isRequired
                        value={formDataRef.current.programStudi}
                        onChange={handleInputChange}
                        errorMessage={errors.programStudi}
                      />
                    </div>
                    <div className="col-lg-6">
                      <Select2Dropdown
                        forInput="personInCharge"
                        label="PIC Kelompok Keahlian"
                        arrData={listKaryawan}
                        value={formDataRef.current.personInCharge}
                        onChange={handleInputChange}
                        errorMessage={errors.personInCharge}
                        disabled={!formDataRef.current.programStudi}
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
            </form>
            {showConfirmation && (
              <Konfirmasi
                title={
                  isBackAction ? "Konfirmasi Kembali" : "Konfirmasi Simpan"
                }
                pesan={
                  isBackAction
                    ? "Apakah anda ingin kembali?"
                    : "Anda yakin ingin simpan data?"
                }
                onYes={handleConfirmYes}
                onNo={handleConfirmNo}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}
