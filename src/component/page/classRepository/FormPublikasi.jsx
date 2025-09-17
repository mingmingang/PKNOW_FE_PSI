import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Alert from "../../part/Alert";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import { decode } from "he";
import Konfirmasi from "../../part/Konfirmasi";
import Select2Dropdown from "../../part/Select2Dropdown";
import Input from "../../part/Input";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import pemula from "../../../assets/Pemula.png";
import menengah from "../../../assets/Menengah.png";
import mahir from "../../../assets/Mahir.png";

export default function PublikasiKelas({ withID, onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  const [activeCategory, setActiveCategory] = useState(null);
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listKategoriProgram, setListKategoriProgram] = useState([]);
  const [listMetode, setListMetode] = useState([]);
  const [listKategoriMetode, setListKategoriMetode] = useState([]);
  const [listMateri, setlistMateri] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const [errors, setErrors] = useState({});
  const [isBerbayar, setIsBerbayar] = useState(false);

  const formDataRef = useRef({
    kke_id: withID.id,
    level_kelas: "",
    tipe_kelas: "",
    metode_pembayaran: "",
    virtual_account: "",
    periode: "",
    harga_kelas: "",
  });

  const [filePreview, setFilePreview] = useState(false);
  const fileGambarRef = useRef(null);
  const fileDocumentRef = useRef(null);

  const userSchema = object({
    kke_id: string().required("Pilih Terlebih Dahulu"),
    level_kelas: string().required("Pilih File Pustaka Terlebih Dahulu"),
    tipe_kelas: string()
      .max(30, "Maksimal 30 Karakter")
      .required("Isi Judul Terlebih Dahulu"),
    metode_pembayaran: string(),
    virtual_account: string().max(200, "Maksimal 200 Karakter"),
    periode: string(),
    harga_kelas: string()
      .max(12, "Maksimal 12 Angka")
      .test(
        "is-numeric",
        "Harus berupa angka",
        (value) => !value || /^\d+$/.test(value.replace(/\./g, ""))
      ),
  });

  const resetForm = () => {
    formDataRef.current = {
      level_kelas: "",
      tipe_kelas: "",
      metode_pembayaran: "",
      virtual_account: "",
      periode: "",
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

  const getListKategoriProgram = async (filter) => {
    try {
      while (true) {
        let data = await UseFetch(
          API_LINK + "KategoriProgram/GetKategoriByIDProgram",
          {
            page: withID.id,
            query: "",
            sort: "[Nama Kategori] asc",
            status: "Aktif",
          }
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar kategori program."
          );
        } else if (data === "data kosong") {
          setListKategoriProgram([]);
          break;
        } else if (data.length === 0) {
          setListKategoriProgram([]);
          break;
        } else {
          setListKategoriProgram(data);
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

  const getMetodePembayaran = async () => {
    try {
      let data = await UseFetch(API_LINK + "Program/GetMetodePembayaran", {});

      if (!data || data.length === 0) {
        throw new Error("Data kosong atau tidak tersedia.");
      } else {
        setListMetode(data);
      }
    } catch (e) {
      setIsError({
        error: true,
        message: e.message,
      });
    }
  };

  const getKategoriMetode = async () => {
    try {
      let data = await UseFetch(API_LINK + "Program/GetKategoriMetode", {
        id: formDataRef.current.metode_pembayaran,
      });

      if (!data || data.length === 0) {
        throw new Error("Data kosong atau tidak tersedia.");
      } else {
        setListKategoriMetode(data);
      }
    } catch (e) {
      setIsError({
        error: true,
        message: e.message,
      });
    }
  };

  useEffect(() => {
    getMetodePembayaran();
  }, []);

  useEffect(() => {
    getKategoriMetode();
  }, [formDataRef.current.metode_pembayaran]);

  useEffect(() => {
    const fetchData = async () => {
      await getListKategoriProgram();
    };

    fetchData();
  }, []);

  const getDataMateriKategori = async (index) => {
    const kategoriKey = index;
    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Materi/GetDataMateriByKategori", {
          page: 1,
          status: "Semua",
          query: "",
          sort: "Judul",
          order: "asc",
          kategori: kategoriKey,
        });

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar kategori program."
          );
        } else if (data === "data kosong") {
          setlistMateri([]);
          break;
        } else if (data.length === 0) {
          setlistMateri([]);
          break;
        } else {
          setlistMateri(data);
          setActiveCategory(kategoriKey);
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

  const toggleCategory = (kategoriKey) => {
    if (activeCategory === kategoriKey) {
      setActiveCategory(null);
    } else {
      setActiveCategory(kategoriKey);
      getDataMateriKategori(kategoriKey);
    }
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

      try {
        const isGratis = formDataRef.current.tipe_kelas === "gratis";

        const hargaKelas = formDataRef.current.harga_kelas
          ? parseInt(formDataRef.current.harga_kelas.replace(/\./g, ""))
          : null;

        const data = await UseFetch(API_LINK + "Program/PublikasiProgram", {
          prg_id: withID.id,
          prg_level: formDataRef.current.level_kelas,
          prg_tipe: formDataRef.current.tipe_kelas,
          prg_pembayaran: isGratis
            ? null
            : formDataRef.current.metode_pembayaran,
          prg_harga: isGratis ? null : hargaKelas,
          prg_periode: formDataRef.current.periode,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data.");
        } else {
          SweetAlert("Sukses", "Program berhasil dipublikasikan", "success");
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

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name === "tipe_kelas") {
      setIsBerbayar(value === "berbayar");
    }

    if (name === "harga_kelas") {
      const numericValue = value.replace(/[^0-9]/g, "");

      const formattedValue =
        numericValue === "" ? "" : Number(numericValue).toLocaleString("id-ID");

      formDataRef.current[name] = numericValue;

      e.target.value = formattedValue;
    } else {
      formDataRef.current[name] = value;
    }

    const validationError = await validateInput(
      name,
      name === "harga_kelas" ? formDataRef.current[name] : value,
      userSchema
    );

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validationError.error,
    }));
  };

  const levelKelasOptions = [
    { Value: "pemula", Text: "Pemula" },
    { Value: "menengah", Text: "Menengah" },
    { Value: "mahir", Text: "Mahir" },
  ];

  const tipeKelasOptions = [
    { Value: "gratis", Text: "Gratis" },
    { Value: "berbayar", Text: "Berbayar" },
  ];

  const periodeOptions = [
    { Value: "1", Text: "1 Bulan" },
    { Value: "3", Text: "3 Bulan" },
    { Value: "6", Text: "6 Bulan" },
    { Value: "12", Text: "12 Bulan" },
    { Value: "9999", Text: "Lifetime" },
  ];

  return (
    <div className="d-flex">
      <div className="" style={{ width: "50%" }}>
        <div className="" style={{ marginTop: "100px" }}></div>
        <div className="d-flex " style={{ marginLeft: "80px" }}>
          <button
            style={{ backgroundColor: "transparent", border: "none" }}
            onClick={handleGoBack}
          >
            <i
              className="fas fa-arrow-left mr-3"
              style={{ color: "#0A5EA8", fontSize: "28px" }}
            ></i>
          </button>
          <p
            className="mt-3"
            style={{ fontSize: "28px", fontWeight: "600", color: "#0A5EA8" }}
          >
            Formulir Publikasi Kelas
          </p>
        </div>

        <form onSubmit={handleAdd}>
          <div
            className="card"
            style={{ margin: "10px 70px", borderRadius: "20px" }}
          >
            <div className="card-body p-4">
              <div className="row mb-3">
                <div className="d-flex">
                  <img
                    src={`${API_LINK}Upload/GetFile/${withID.gambar}`}
                    alt="Preview"
                    style={{
                      width: "200px",
                      borderRadius: "25px",
                    }}
                  />
                  <div className="">
                    <h4
                      style={{
                        color: "#0A5EA8",
                        padding: "30px",
                        paddingBottom: "0px",
                        fontWeight: "bold",
                      }}
                    >
                      {withID.title}
                    </h4>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="">
                  <div className="">
                    <label
                      className="form-label"
                      style={{ fontWeight: "bold" }}
                    >
                      Level Kelas <span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="d-flex align-items-center gap-3 mb-3 ml-4 justify-content-between">
                      {levelKelasOptions.map((option, index) => (
                        <div key={index} className="d-flex align-items-center">
                          <input
                            type="radio"
                            id={`level_kelas_${option.Value}`}
                            name="level_kelas"
                            value={option.Value}
                            className="form-check-input"
                            checked={
                              formDataRef.current.level_kelas === option.Value
                            }
                            onChange={(e) => handleInputChange(e)}
                            style={{ marginRight: "5px" }}
                          />
                          {option.Value === "pemula" && (
                            <img
                              src={pemula}
                              alt="Pemula"
                              style={{
                                width: "30px",
                                height: "30px",
                                marginRight: "10px",
                              }}
                            />
                          )}
                          {option.Value === "menengah" && (
                            <img
                              src={menengah}
                              alt="Menengah"
                              style={{
                                width: "30px",
                                height: "30px",
                                marginRight: "10px",
                              }}
                            />
                          )}
                          {option.Value === "mahir" && (
                            <img
                              src={mahir}
                              alt="Mahir"
                              style={{
                                width: "30px",
                                height: "30px",
                                marginRight: "10px",
                              }}
                            />
                          )}
                          <label
                            htmlFor={`level_kelas_${option.Value}`}
                            className="form-check-label"
                            style={{ marginRight: "20px" }}
                          >
                            {option.Text}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.level_kelas && (
                      <div className="text-danger">{errors.level_kelas}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="">
                  <div className="">
                    <Select2Dropdown
                      forInput="tipe_kelas"
                      label="Tipe Kelas"
                      arrData={tipeKelasOptions}
                      isRequired
                      value={formDataRef.current.tipe_kelas}
                      onChange={handleInputChange}
                      errorMessage={errors.kke_id}
                    />
                  </div>
                </div>
              </div>

              {isBerbayar && (
                <>
                  <div className="row">
                    <div className="">
                      <div className="">
                        <Select2Dropdown
                          forInput="metode_pembayaran"
                          label="Metode Pembayaran"
                          arrData={listMetode}
                          isRequired
                          value={formDataRef.current.metode_pembayaran}
                          onChange={handleInputChange}
                          errorMessage={errors.metode_pembayaran}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="">
                      <div className="">
                        <Select2Dropdown
                          forInput="virtual_account"
                          label="Kategori Metode"
                          arrData={listKategoriMetode}
                          isRequired
                          value={formDataRef.current.virtual_account}
                          onChange={handleInputChange}
                          errorMessage={errors.virtual_account}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="">
                      <div className="">
                        <Input
                          type="text"
                          name="harga_kelas"
                          forInput="harga_kelas"
                          label="Harga Kelas (Rp.)"
                          isRequired={isBerbayar}
                          value={
                            formDataRef.current.harga_kelas
                              ? Number(
                                  formDataRef.current.harga_kelas
                                ).toLocaleString("id-ID")
                              : ""
                          }
                          onChange={handleInputChange}
                          onKeyDown={(e) => {
                            if (
                              !/[0-9]|Backspace|Delete|Tab|ArrowLeft|ArrowRight/.test(
                                e.key
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                          errorMessage={errors.harga_kelas}
                          placeholder="Masukan Nominal Harga"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="row">
                <div className="">
                  <div className="">
                    <Select2Dropdown
                      forInput="periode"
                      label="Periode"
                      arrData={periodeOptions}
                      isRequired
                      value={formDataRef.current.periode}
                      onChange={handleInputChange}
                      errorMessage={errors.kke_id}
                    />
                  </div>
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
                Publikasikan
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="" style={{ width: "50%" }}>
        <div>
          <div className="">
            <h3
              style={{
                marginTop: "100px",
                marginBottom: "20px",
                fontWeight: "600",
                color: "#0A5EA8",
              }}
            >
              {" "}
              <i className="fas fa-list-ul"></i> Rincian Kelas
            </h3>
          </div>
          <img
            className="cover-daftar-kk"
            style={{
              objectFit: "cover",
              borderRadius: "40px",
            }}
            height="400"
            src={`${API_LINK}Upload/GetFile/${withID.gambar}`}
            width="700"
          />
          <h4
            style={{
              color: "#0A5EA8",
              padding: "30px",
              paddingBottom: "0px",
              fontWeight: "bold",
            }}
          >
            {withID.title}
          </h4>
          <p style={{ paddingLeft: "30px", color: "black" }}>
            Program Studi : {withID.ProgramStudi}
          </p>
        </div>
        <div className="" style={{ margin: "30px" }}>
          <h3 style={{ fontWeight: "500", color: "#0A5EA8" }}>Tentang Kelas</h3>
          <p
            style={{
              textAlign: "justify",
              marginTop: "20px",
              lineHeight: "30px",
            }}
          >
            {decode(withID.desc)}
          </p>
        </div>

        <div className="" style={{ margin: "30px" }}>
          <h3 className="mb-4" style={{ fontWeight: "500", color: "#0A5EA8" }}>
            Materi Kelas
          </h3>

          {listKategoriProgram.length > 0 ? (
            listKategoriProgram.map((kategori, index) => (
              <div
                key={index}
                className="section"
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  padding: "10px",
                  marginBottom: "10px",
                }}
                onClick={() => toggleCategory(kategori.Key)}
              >
                <div
                  className="section-header"
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                ></div>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#555",
                    fontWeight: "bold",
                  }}
                >
                  <i
                    className={`fas ${
                      activeCategory === kategori.Key
                        ? "fa-chevron-up"
                        : "fa-chevron-down"
                    } mr-3 ml-3`}
                    style={{
                      fontSize: "16px",
                    }}
                  ></i>
                  {kategori["Nama Kategori Program"] || "Tidak ada deskripsi."}{" "}
                  <br />
                </p>
                {activeCategory === kategori.Key && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      borderTop: "1px solid #ccc",
                    }}
                  >
                    {listMateri.length > 0 ? (
                      listMateri
                        .filter((materi) => materi.Status === "Aktif")
                        .map((materi, materiIndex) => (
                          <div
                            className="d-flex"
                            key={materiIndex}
                            style={{
                              background: "#f9f9f9",
                              marginBottom: "8px",
                              padding: "8px",
                              borderRadius: "5px",
                            }}
                          >
                            <div className="">
                              <img
                                className="cover-daftar-kk"
                                style={{ borderRadius: "20px" }}
                                height="150"
                                src={`${API_LINK}Upload/GetFile/${materi.Gambar}`}
                                width="300"
                              />
                            </div>
                            <div className="ml-3">
                              <p
                                style={{
                                  fontSize: "24px",
                                  fontWeight: "600",
                                  color: "#0A5EA8",
                                  margin: "0",
                                }}
                              >
                                {materi.Judul || "Judul tidak tersedia"}
                              </p>
                              <p
                                style={{
                                  fontSize: "15px",
                                  color: "#555",
                                  width: "100%",
                                  textAlign: "justify",
                                }}
                              >
                                {materi.Keterangan ||
                                  "Deskripsi tidak tersedia"}
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <Alert
                        type="warning mt-3"
                        message="Tidak ada materi yang tersedia pada kategori ini"
                      />
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <Alert
              type="warning mt-3"
              message="Tidak ada kategori program yang tersedia"
            />
          )}
        </div>

        <></>
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
      </div>
    </div>
  );
}
