import { useRef, useState, useEffect } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../util/Constants";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import UseFetch from "../../../util/UseFetch";
import Input from "../../../part/Input";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import SweetAlert from "../../../util/SweetAlert";
import BackPage from "../../../../assets/backPage.png";
import Konfirmasi from "../../../part/Konfirmasi";
import FileUpload from "../../../part/FileUpload";
import UploadFile from "../../../util/UploadFile";
import { decode } from "html-entities";
import "../../../../style/ProgramEdit.css";

export default function ProgramEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const [filePreview, setFilePreview] = useState(false);
  const fileGambarRef = useRef(null);

  const [formData, setFormData] = useState({
    idProgram: "",
    idKK: "",
    nama: "",
    deskripsi: "",
    status: "",
    pro_gambar: "",
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

  const userSchema = object({
    idProgram: string(),
    idKK: string(),
    nama: string().max(100, "maksimum 100 karakter").required("harus diisi"),
    deskripsi: string()
      .max(500, "maksimum 500 karakter")
      .required("harus diisi"),
    status: string(),
    pro_gambar: string(),
  });

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    try {
      await userSchema.validateAt(name, { [name]: value });
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    } catch (error) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: error.message }));
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  useEffect(() => {
    setFormData({
      idProgram: withID.Key,
      idKK: withID.KKiD,
      nama: withID["Nama Program"],
      deskripsi: withID.Deskripsi,
      status: withID.Status,
      pro_gambar: withID.Gambar,
    });
  }, [withID]);

  const resetForm = () => {
    setFormData({
      idProgram: withID.Key,
      idKK: withID.KKiD,
      nama: withID["Nama Program"],
      deskripsi: withID.Deskripsi,
      status: withID.Status,
      pro_gambar: withID.Gambar,
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formData,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);

      setIsError((prevError) => ({
        ...prevError,
        error: false,
      }));

      setErrors({});

      try {
        let proGambar = "";

        if (fileGambarRef.current.files.length > 0) {
          const uploadResults = await Promise.all([
            UploadFile(fileGambarRef.current),
          ]);
          proGambar = uploadResults[0].Hasil;
        }

        const updatedFormData = {
          ...formData,
          pro_gambar: proGambar,
        };

        const data = await UseFetch(
          API_LINK + "Program/EditProgram",
          updatedFormData
        );

        if (data === "ERROR") {
          setIsError((prevError) => ({
            ...prevError,
            error: true,
            message: "Terjadi kesalahan: Gagal mengubah data program.",
          }));
        } else {
          SweetAlert("Sukses", "Data program berhasil diubah", "success");
          onChangePage("index");
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: "Terjadi kesalahan saat memproses data.",
        }));
      } finally {
        setIsLoading(false);
      }
    }
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

  if (isLoading) return <Loading />;

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
          <div className="program-edit-container">
            <div className="header-section">
              <div className="d-flex">
                <button className="back-button" onClick={handleGoBack}>
                  <img src={BackPage} alt="" />
                </button>
                <h4 className="page-title program">Edit Program</h4>
              </div>
            </div>
          </div>
          <div className="form-container">
            <form onSubmit={handleAdd}>
              <div className="card edit-card">
                <div className="card-body p-4">
                  <div className="row">
                    <div className="col-lg-4 file-preview-section">
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
                          label="Gambar Program (.jpg/.png)"
                          formatFile=".png, .jpg"
                          ref={fileGambarRef}
                          onChange={() =>
                            handleFileChange(fileGambarRef, "png,jpg")
                          }
                          errorMessage={errors.pro_gambar}
                          isRequired={false}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12">
                      <Input
                        type="text"
                        forInput="nama"
                        label="Nama Program"
                        isRequired
                        placeholder="Nama Program"
                        value={
                          formData && formData.nama ? decode(formData.nama) : ""
                        }
                        onChange={handleInputChange}
                        errorMessage={errors.nama}
                      />
                    </div>
                    <div className="col-lg-12">
                      <Input
                        type="textarea"
                        placeholder="Deskripsi/Penjelasan Program"
                        forInput="deskripsi"
                        label="Deskripsi/Penjelasan Program"
                        isRequired
                        value={
                          formData && formData.deskripsi
                            ? decode(formData.deskripsi)
                            : ""
                        }
                        onChange={handleInputChange}
                        errorMessage={errors.deskripsi}
                      />
                    </div>
                  </div>
                </div>
                <div className="action-buttons">
                  <button
                    className="cancel-button"
                    type="button"
                    onClick={resetForm}
                  >
                    Batalkan
                  </button>
                  <button className="save-button" type="submit">
                    Simpan
                  </button>
                </div>
              </div>
            </form>
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
        </>
      )}
    </>
  );
}
