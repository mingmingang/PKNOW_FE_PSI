import { useState, useEffect } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../util/Constants";
import { validateAllInputs } from "../../../util/ValidateForm";
import UseFetch from "../../../util/UseFetch";
import Input from "../../../part/Input";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import SweetAlert from "../../../util/SweetAlert";
import BackPage from "../../../../assets/backPage.png";
import Konfirmasi from "../../../part/Konfirmasi";
import { decode } from "html-entities";
import "../../../../style/KategoriProgramEdit.css";

export default function ProgramEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const [formData, setFormData] = useState({
    idKatProgram: "",
    idProgram: "",
    nama: "",
    deskripsi: "",
    status: "",
  });

  const userSchema = object({
    idKatProgram: string(),
    idProgram: string(),
    nama: string().max(100, "maksimum 100 karakter").required("harus diisi"),
    deskripsi: string()
      .max(500, "maksimum 500 karakter")
      .required("harus diisi"),
    status: string(),
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
      idKatProgram: withID.Key,
      idProgram: withID.ProID,
      nama: withID["Nama Kategori"],
      deskripsi: withID.Deskripsi,
      status: withID.Status,
    });
  }, [withID]);

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formData,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);

      setIsError((prevError) => {
        return { ...prevError, error: false };
      });

      setErrors({});

      UseFetch(API_LINK + "KategoriProgram/EditKategoriProgram", formData)
        .then((data) => {
          if (data === "ERROR") {
            setIsError((prevError) => {
              return {
                ...prevError,
                error: true,
                message: "Terjadi kesalahan: Gagal mengubah data mata kuliah.",
              };
            });
          } else {
            SweetAlert("Sukses", "Kategori Program berhasil diubah", "success");
            onChangePage("index");
          }
        })
        .then(() => setIsLoading(false));
    }
  };

  const resetForm = () => {
    setFormData({
      idKatProgram: withID.Key,
      idProgram: withID.ProID,
      nama: withID["Nama Kategori"],
      deskripsi: withID.Deskripsi,
      status: withID.Status,
    });
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
            <div className="container d-flex">
              <button className="back-button" onClick={handleGoBack}>
                <img src={BackPage} alt="" />
              </button>
              <h4 className="page-title">Edit Kategori Program</h4>
            </div>
          </div>
          <form onSubmit={handleAdd} className="edit-form kategori">
            <div className="container card edit-card">
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-12">
                    <Input
                      type="text"
                      forInput="nama"
                      label="Nama Kategori"
                      isRequired
                      placeholder="Nama Kategori"
                      value={
                        formData && decode(formData.nama)
                          ? decode(formData.nama)
                          : ""
                      }
                      onChange={handleInputChange}
                      errorMessage={errors.nama}
                    />
                  </div>
                  <div className="col-lg-12">
                    <Input
                      type="textarea"
                      placeholder="Deskripsi/Penjelasan Kategori Program"
                      forInput="deskripsi"
                      label="Deskripsi/Penjelasan Kategori Program"
                      isRequired
                      value={
                        formData && decode(formData.deskripsi)
                          ? decode(formData.deskripsi)
                          : ""
                      }
                      onChange={handleInputChange}
                      errorMessage={errors.deskripsi}
                    />
                  </div>
                </div>
              </div>
              <div className="action-buttons edit-kat">
                <button
                  className="cancel-button edit-kat"
                  type="button"
                  onClick={resetForm}
                >
                  Batalkan
                </button>
                <button className="save-button edit-kat" type="submit">
                  Simpan
                </button>
              </div>
            </div>
          </form>
        </>
      )}
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
