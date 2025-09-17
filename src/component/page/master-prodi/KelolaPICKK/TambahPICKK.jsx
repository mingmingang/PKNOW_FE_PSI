import { useRef, useState, useEffect } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../util/Constants";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import UseFetch from "../../../util/UseFetch";
import Select2Dropdown from "../../../part/Select2Dropdown";
import Input from "../../../part/Input";
import Loading from "../../../part/Loading";
import Alert from "../../../part/AlertLogin";
import SweetAlert from "../../../util/SweetAlert";
import Konfirmasi from "../../../part/Konfirmasi";
import BackPage from "../../../../assets/backPage.png";
import FileUpload from "../../../part/FileUpload";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import AnimatedSection from "../../../part/AnimatedSection";

export default function TambahPIC({ onChangePage, withID }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listProdi, setListProdi] = useState([]);
  const [listKaryawan, setListKaryawan] = useState([]);
  const [isBackAction, setIsBackAction] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  const resetForm = () => {
    formDataRef.current = {
      personInCharge: "",
    };
  };

  const formDataRef = useRef({
    key: "",
    nama: "",
    programStudi: "",
    personInCharge: "",
    deskripsi: "",
    gambar: "",
    status: "Aktif",
  });

  const userSchema = object({
    key: string(),
    nama: string().max(25, "maksimum 25 karakter").required("harus diisi"),
    programStudi: string().required("harus dipilih"),
    personInCharge: string(),
    deskripsi: string()
      .min(100, "minimum 100 karakter")
      .required("harus diisi"),
    gambar: string(),
    status: string(),
  });

  const fileGambarRef = useRef(null);

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
    formDataRef.current = {
      key: withID.id,
      nama: withID.title,
      programStudi: withID.prodi.key,
      personInCharge: withID.pic.key ? withID.pic.key : "",
      deskripsi: withID.desc,
      gambar: withID.gambar,
      status: withID.status,
    };
  }, []);

  useEffect(() => {
    getListProdi();
  }, []);

  useEffect(() => {
    if (formDataRef.current.programStudi) {
      getListKaryawan();
    }
  }, [formDataRef.current.programStudi]);

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      try {
        const data = await UseFetch(
          API_LINK + "KK/EditKK",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Alert("Terjadi kesalahan: Gagal mengedit data program.");
        } else {
          const statusData = await UseFetch(API_LINK + "KK/SetStatusKK", {
            idKK: formDataRef.current.key,
            status: "Aktif",
            pic: formDataRef.current.personInCharge,
          });

          if (statusData === "ERROR" || statusData.length === 0) {
            setIsError((prevError) => ({
              ...prevError,
              error: true,
              message: "Gagal mengubah status kelompok keahlian.",
            }));
          } else {
            UseFetch(API_LINK + "Utilities/createNotifikasi", {
              p1: "SENTTOTENAGAPENDIDIK",
              p2: "ID12346",
              p3: "APP64",
              p4: "PRODI",
              p5: activeUser,
              p6: "Anda terpilih sebagai PIC Kelompok Keahlian yang dipilih oleh Prodi",
              p7: "Notifikasi PIC Kelompok Keahlian",
              p8: "Dimohon untuk membuat Progaram beserta Kategori Program.",
              p9: "Dari PRODI",
              p10: "0",
              p11: "Jenis Lain",
              p12: activeUser,
              p13: "ROL25",
              p14: formDataRef.current.personInCharge,
            }).then((data) => {
              if (data === "ERROR" || data.length === 0) setIsError(true);
              else {
                SweetAlert(
                  "Berhasil",
                  "Notifikasi telah dikirimkan ke Tenaga Pendidik.",
                  "success"
                );
                UseFetch(API_LINK + "Utilities/createNotifikasi", {
                  p1: "SENTOPICPKNOW",
                  p2: "ID123457",
                  p3: "APP64",
                  p4: "PRODI",
                  p5: activeUser,
                  p6: "PIC KK telah ditetapkan oleh Prodi",
                  p7: "Penetapan PIC KK",
                  p8: "PIC KK telah berhasil dipilih oleh Prodi",
                  p9: "Dari Prodi",
                  p10: "0",
                  p11: "Jenis Lain",
                  p12: activeUser,
                  p13: "ROL56",
                }).then((data) => {
                  if (data === "ERROR" || data.length === 0) setIsError(true);
                  else {
                    SweetAlert(
                      "Berhasil",
                      "Notifikasi telah dikirimkan ke PIC P-KNOW.",
                      "success"
                    );
                  }
                });
              }
            });

            SweetAlert(
              "Sukses",
              "PIC kelompok keahlian berhasil ditambahkan",
              "success"
            );

            onChangePage("index");
          }
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

  return (
    <>
      <AnimatedSection>
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
                  Edit Kelompok Keahlian
                </h4>
              </div>
            </div>
            <div className="container mb-4">
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
                                src={`${API_LINK}Upload/GetFile/${formDataRef.current.gambar}`}
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
                            forInput="gambarKelompokKeahlian"
                            label="Gambar Kelompok Keahlian (.png)"
                            formatFile=".png"
                            ref={fileGambarRef}
                            onChange={() =>
                              handleFileChange(fileGambarRef, "png")
                            }
                            errorMessage={errors.gambar}
                            isRequired={false}
                            isDisabled={true}
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
                          isDisabled={true}
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
                          isDisabled={true}
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
                          isDisabled={true}
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
                      Edit
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
      </AnimatedSection>
    </>
  );
}
