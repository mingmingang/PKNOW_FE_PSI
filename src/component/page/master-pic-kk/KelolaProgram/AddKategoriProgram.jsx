import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../util/Constants";
import { validateAllInputs } from "../../../util/ValidateForm";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import Input from "../../../part/Input";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import Label from "../../../part/Label";
import BackPage from "../../../../assets/backPage.png";
import Konfirmasi from "../../../part/Konfirmasi";
import { decode } from "he";
import "../../../../style/KategoriProgramAdd.css";

export default function KategoriProgramAdd({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
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

  const formDataRef = useRef({
    idProgram: "",
    nama: "",
    deskripsi: "",
  });

  const resetForm = () => {
    formDataRef.current = {
      idProgram: withID.Key,
      nama: "",
      deskripsi: "",
    };
  };

  const userSchema = object({
    idProgram: string(),
    nama: string().max(100, "maksimum 100 karakter").required("harus diisi"),
    deskripsi: string().required("harus dipilih"),
  });

  useEffect(() => {
    formDataRef.current = {
      idProgram: withID.Key,
      nama: "",
      deskripsi: "",
    };
  }, []);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    try {
      await userSchema.validateAt(name, { [name]: value });
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    } catch (error) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: error.message }));
    }

    formDataRef.current[name] = value;
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

      setIsError((prevError) => {
        return { ...prevError, error: false };
      });

      setErrors({});

      UseFetch(
        API_LINK + "KategoriProgram/CreateKategoriProgram",
        formDataRef.current
      )
        .then((data) => {
          if (data === "ERROR") {
            setIsError((prevError) => {
              return {
                ...prevError,
                error: true,
                message:
                  "Terjadi kesalahan: Gagal menyimpan data kategori program.",
              };
            });
          } else {
            SweetAlert("Sukses", "Data Kategori berhasil disimpan", "success");
            onChangePage("index");
          }
        })
        .then(() => setIsLoading(false));
    }
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
          <div className="kategori-add-container">
            <div className="header-section">
              <div className="back-and-title add-kat">
                <button className="back-button" onClick={handleGoBack}>
                  <img src={BackPage} alt="" />
                </button>
                <h4 className="page-title kategori">Tambah Kategori</h4>
              </div>
              <div className="ket-draft">
                <span className="draft-badge badge text-bg-dark ">Draft</span>
              </div>
            </div>
          </div>
          <div className="form-container add-kat">
            <form onSubmit={handleAdd}>
              <div className="card form-card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-lg-12">
                      <Label
                        title="Nama Program"
                        data={decode(withID["Nama Program"])}
                      />
                    </div>
                    <div className="col-lg-12 form-input">
                      <Input
                        type="text"
                        forInput="nama"
                        label="Nama Kategori"
                        isRequired
                        placeholder="Nama Kategori"
                        value={formDataRef.current.nama}
                        onChange={handleInputChange}
                        errorMessage={errors.nama}
                      />
                    </div>
                    <div className="col-lg-12 form-input">
                      <Input
                        type="textarea"
                        placeholder="Deskripsi/Penjelasan Kategori Program"
                        forInput="deskripsi"
                        label="Deskripsi/Penjelasan Kategori Program"
                        isRequired
                        value={formDataRef.current.deskripsi}
                        onChange={handleInputChange}
                        errorMessage={errors.deskripsi}
                      />
                    </div>
                  </div>
                </div>
                <div className="action-buttons add-kat">
                  <button
                    className="cancel-button add-kat"
                    type="button"
                    onClick={resetForm}
                  >
                    Batalkan
                  </button>
                  <button className="save-button add-kat" type="submit">
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
