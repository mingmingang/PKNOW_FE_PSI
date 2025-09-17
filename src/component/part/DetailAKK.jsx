import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap, faUser } from "@fortawesome/free-solid-svg-icons";
import Button from "./Button copy";
import "../../style/DetailAKK.css";
import Konfirmasi from "./Konfirmasi";
import { API_LINK } from "../util/Constants";
import BackPage from "../../assets/backPage.png";
import { useEffect, useRef } from "react";
import UseFetch from "../util/UseFetch";
import DropDown from "./Dropdown";
import Input from "./Input";
import Loading from "./Loading";
import Alert from "./Alert";
import Filter from "./Filter";
import Icon from "./Icon";
import SweetAlert from "../util/SweetAlert";
import pknowmaskot from "../../assets/pknowmaskot.png";
import Cookies from "js-cookie";
import { decryptId } from "../util/Encryptor";
import { decode } from "he";

export default function DetailAKK({ prodi, onChangePage, withID }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAnggota, setIsLoadingAnggota] = useState(true);
  const [isLoadingDosen, setIsLoadingDosen] = useState(true);
  const [isLoadingProdi, setIsLoadingProdi] = useState(true);
  const [listAnggota, setListAnggota] = useState([]);
  const [listDosen, setListDosen] = useState([]);
  const [listProdi, setListProdi] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Anggota] asc",
    status: "Aktif",
    kke_id: withID.id,
  });

  const handleGoBack = () => {
    setIsBackAction(true);
    setShowConfirmation(true);
  };

  const handleConfirmYesBack = () => {
    setShowConfirmation(false);
    onChangePage("index");
  };

  const handleConfirmNoBack = () => {
    setShowConfirmation(false);
  };

  const [currentDosenFilter, setCurrentDosenFilter] = useState({
    prodi: "",
  });

  const formDataRef = useRef({
    key: "",
    nama: "",
    programStudi: "",
    personInCharge: "",
    deskripsi: "",
    status: "",
  });

  const searchAnggotaQuery = useRef();

  const handleAnggotaSearch = () => {
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchAnggotaQuery.current.value || "",
    }));
  };

  const handleSetCurrentPage = (newCurrentPage) => {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  };

  const getListAnggota = async () => {
    setIsError({ error: false, message: "" });
    setIsLoadingAnggota(true);

    try {
      while (true) {
        let data = await UseFetch(
          API_LINK + "AnggotaKK/GetAnggotaKK",
          currentFilter
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar anggota.");
        } else if (data === "data kosong") {
          setListAnggota([]);
          setIsLoadingAnggota(false);
          break;
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setListAnggota(data);
          setIsLoadingAnggota(false);
          break;
        }
      }
    } catch (e) {
      setIsLoadingAnggota(false);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  const getListProdi = async () => {
    setIsLoadingProdi(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "KK/GetListProdi", {});

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar prodi.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setListProdi(data);
          setIsLoadingProdi(false);
          break;
        }
      }
    } catch (e) {
      setIsLoadingProdi(false);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  const getListDosen = async () => {
    setIsLoadingDosen(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "AnggotaKK/GetListDosen", {});

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar dosen.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setListDosen(data);
          setIsLoadingDosen(false);
          break;
        }
      }
    } catch (e) {
      setIsLoadingDosen(false);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  useEffect(() => {
    if (withID) {
      formDataRef.current = {
        key: withID.id,
        nama: withID.title,
        programStudi: withID.prodi.nama,
        personInCharge: withID.pic.nama,
        deskripsi: withID.desc,
        status: withID.status,
      };
      setCurrentFilter((prevFilter) => ({
        ...prevFilter,
        kke_id: withID.id,
      }));
    }
    getListProdi();
    getListDosen();
  }, [withID]);

  useEffect(() => {
    getListAnggota();
    getListDosen();
  }, [currentFilter]);

  useEffect(() => {
    setIsLoading(isLoadingProdi || isLoadingAnggota || isLoadingDosen);
  }, [isLoadingProdi, isLoadingAnggota, isLoadingDosen]);

  const handleDelete = (id) => () => {
    setIsError(false);
    SweetAlert(
      "Konfirmasi Hapus",
      "Anda yakin ingin mengeluarkan anggota ini dari Keahlian?",
      "warning",
      "Ya"
    ).then((confirm) => {
      if (confirm) {
        setIsLoading(true);
        UseFetch(API_LINK + "AnggotaKK/SetStatusAnggotaKK", {
          idAkk: id,
          status: "Dibatalkan",
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else {
              SweetAlert(
                "Berhasil",
                "Karyawan telah dihapus dari Anggota Keahlian.",
                "success"
              );
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .finally(() => setIsLoading(false));
      }
    });
  };

  const handleTambahAnggota = (id) => () => {
    setIsError(false);
    SweetAlert(
      "Konfirmasi Tambah",
      "Anda yakin ingin menambahkan anggota ini dari Keahlian?",
      "info",
      "Ya"
    ).then((confirm) => {
      if (confirm) {
        setIsLoading(true);
        UseFetch(API_LINK + "AnggotaKK/TambahAnggotaByPIC", {
          idAkk: formDataRef.current.key,
          kry: id,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else {
              UseFetch(API_LINK + "Utilities/createNotifikasi", {
                p1: "SENTTOTENAGAPENDIDIK",
                p2: "ID12346",
                p3: "APP64",
                p4: "PIC P-KNOW",
                p5: activeUser,
                p6: "Anda terpilih sebagai anggota Kelompok Keahlian yang dipilih langsung oleh PIC P-KNOW",
                p7: "Notifikasi Anggota Kelompok Keahlian",
                p8: "Dimohon kepada pihak program studi untuk memilih salah satu PIC KK yang dapat mengampu kelompok keahlian",
                p9: "Dari PIC P-KNOW",
                p10: "0",
                p11: "Jenis Lain",
                p12: activeUser,
                p13: "ROL25",
                p14: id,
              }).then((data) => {
                if (data === "ERROR" || data.length === 0) setIsError(true);
                else {
                  setCurrentFilter((prevFilter) => ({
                    ...prevFilter,
                    query: "",
                    page: 1,
                  }));
                  searchAnggotaQuery.current.value = "";

                  SweetAlert(
                    "Berhasil",
                    "Notifikasi telah dikirimkan ke Tenaga Pendidik bersangkutan.",
                    "success"
                  );
                }
              });
              SweetAlert(
                "Berhasil",
                "Karyawan telah ditambahkan ke Anggota Keahlian.",
                "success"
              );
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });
  };

  const handleProdiChange = (e) => {
    const selectedProdiText = e.target.options[e.target.selectedIndex].text;
    setCurrentDosenFilter({
      prodi: selectedProdiText === "-- Semua --" ? "" : selectedProdiText,
    });
  };

  const filteredDosen = listDosen.filter((dosen) =>
    currentDosenFilter.prodi ? dosen.Prodi === currentDosenFilter.prodi : true
  );

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <>
      <div
        className="back-and-title"
        style={{ display: "flex", marginLeft: "80px", marginTop: "100px" }}
      >
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
          Kelompok Keahlian
        </h4>
      </div>
      <div className="content-container">
        <div className="information-kelompok-keahlian">
          <div className="informasi-kk">
            <h1 className="title">{decode(withID.title)}</h1>
            <div className="prodi" style={{ marginBottom: "-20px" }}>
              <FontAwesomeIcon
                icon={faGraduationCap}
                style={{
                  fontSize: "1.5rem",
                  marginRight: "-5px",
                  marginTop: "-15px",
                }}
              />
              <p className="text-gray-700" style={{ fontFamily: "Poppins" }}>
                {withID.prodi.nama}
              </p>
            </div>
            <p className="about" style={{ fontSize: "22px" }}>
              Tentang Kelompok Keahlian
            </p>
            <p
              className="deskripsi"
              style={{ fontSize: "17px", width: "100%" }}
            >
              {truncateText(decode(withID.desc), 250)}
            </p>
            <div className="userProdi">
              <FontAwesomeIcon
                icon={faUser}
                style={{ fontSize: "1.5rem", marginTop: "-20px" }}
              />
              <p className="text-gray-700" style={{ fontFamily: "Poppins" }}>
                PIC: {withID.pic.nama}
              </p>
            </div>
          </div>
          <div className="col-lg-5 mt-2">
            <img
              className="detail-kk img-fluid"
              src={`${API_LINK}Upload/GetFile/${withID.gambar}`}
              alt=""
              style={{ width: "500px", height: "60%", objectFit: "cover" }}
            />
          </div>
        </div>
        <>
          {isError.error && (
            <div className="flex-fill">
              <Alert type="danger" message={isError.message} />
            </div>
          )}
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column" style={{ marginLeft: "-20px" }}>
              <div className="flex-fill">
                <div className="container">
                  <div className="row pt-2">
                    <div className="col-lg-7 px-4">
                      <div
                        className="card"
                        style={{
                          marginBottom: "18px",
                          border: "none",
                          boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.1)",
                          borderRadius: "15px",
                        }}
                      >
                        <div
                          className="fw-bold ml-3 mt-4"
                          style={{ fontSize: "22px", color: "#0A5EA8" }}
                        >
                          Daftar Anggota
                        </div>
                        <div className="card-body">
                          <div className="input-group mb-3">
                            <Input
                              ref={searchAnggotaQuery}
                              forInput="pencarianProduk"
                              placeholder="Cari"
                            />
                            <Button
                              iconName="search"
                              classType="primary"
                              title="Cari"
                              onClick={handleAnggotaSearch}
                              style={{
                                height: "38px",
                                marginTop: "0px",
                                backgroundColor: "#0A5EA8",
                                border: "none",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              maxHeight: "420px",
                              overflowY: "auto",
                              paddingRight: "6px",
                            }}
                          >
                            {listAnggota.length > 0 ? (
                              listAnggota[0].Message ? (
                                <p>Tidak Ada Anggota Aktif</p>
                              ) : (
                                listAnggota.map((ag, index) => (
                                  <div
                                    className="card-profile mb-3 d-flex justify-content-between shadow-sm rounded-3"
                                    key={ag.Key}
                                  >
                                    <div className="d-flex w-100">
                                      <p
                                        className="mb-0 px-1 py-2 mt-2 me-2 fw-bold ml-3"
                                        style={{ color: "#0A5EA8" }}
                                      >
                                        {index + 1}
                                      </p>

                                      <div className="p-1 ps-2 d-flex">
                                        <img
                                          src={pknowmaskot}
                                          alt={ag["Nama Anggota"]}
                                          className="img-fluid rounded-circle"
                                          width="45"
                                        />
                                        <div
                                          className="ps-3"
                                          style={{ color: "#0A5EA8" }}
                                        >
                                          <p className="mb-0 fw-bold">
                                            {ag["Nama Anggota"]}
                                          </p>
                                          <p
                                            className="mb-0 fw-semibold"
                                            style={{ fontSize: "13px" }}
                                          >
                                            {ag.Prodi}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <Icon
                                        name="trash"
                                        type="Bold"
                                        cssClass="btn px-2 py-0 mr-2"
                                        style={{ color: "red" }}
                                        title="Hapus Anggota"
                                        onClick={handleDelete(ag.Key)}
                                      />
                                    </div>
                                  </div>
                                ))
                              )
                            ) : (
                              <p>Tidak Ada Anggota Aktif</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-5">
                      <div
                        className="card"
                        style={{
                          border: "none",
                          boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.1)",
                          borderRadius: "15px",
                        }}
                      >
                        <div
                          className="d-flex"
                          style={{ justifyContent: "space-between" }}
                        >
                          <div
                            className="fw-bold ml-3 mt-4"
                            style={{
                              fontSize: "22px",
                              color: "#0A5EA8",
                              width: "500px",
                            }}
                          >
                            Tambah Anggota
                          </div>
                          <div className=" mt-3 mr-3">
                            <Filter name="Urutkan">
                              <DropDown
                                forInput="ddProdi"
                                label="Program Studi"
                                type="semua"
                                defaultValue=""
                                arrData={listProdi}
                                onChange={handleProdiChange}
                              />
                            </Filter>
                          </div>
                        </div>
                        <div
                          className="card-body"
                          style={{
                            maxHeight: "500px",
                            overflowY: "auto",
                          }}
                        >
                          {filteredDosen.map((value) => (
                            <div key={value.Key}>
                              <h6 className="fw-semibold mb-3">{value.Text}</h6>
                              <div
                                className="card-profile mb-4 d-flex justify-content-between shadow-sm"
                                style={{
                                  border: "none",
                                  boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.1)",
                                  borderRadius: "15px",
                                }}
                              >
                                <div className="d-flex w-100">
                                  <div className="p-1 ps-2 d-flex">
                                    <img
                                      src={pknowmaskot}
                                      alt={value["Nama Karyawan"]}
                                      className="img-fluid rounded-circle"
                                      width="45"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                      }}
                                    />
                                    <div className="ps-3">
                                      <p
                                        className="mb-0"
                                        style={{
                                          color: "#0A5EA8",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {value["Nama Karyawan"]}
                                      </p>
                                      <p
                                        className="mb-0"
                                        style={{
                                          fontSize: "13px",
                                          color: "#0A5EA8",
                                          fontWeight: "600",
                                        }}
                                      >
                                        {value.Prodi}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="d-flex align-items-center">
                                  <Icon
                                    name="plus"
                                    type="Bold"
                                    cssClass="btn px-2 py-1 text-primary"
                                    title="Tambah Menjadi Anggota"
                                    onClick={handleTambahAnggota(value.Key)}
                                    style={{
                                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                                      marginRight: "20px",
                                      padding: "50px",
                                      fontWeight: "bold",
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      </div>
      {showConfirmation && (
        <Konfirmasi
          title={isBackAction ? "Konfirmasi Kembali" : "Konfirmasi Simpan"}
          pesan={
            isBackAction
              ? "Apakah anda ingin kembali?"
              : "Anda yakin ingin simpan data?"
          }
          onYes={handleConfirmYesBack}
          onNo={handleConfirmNoBack}
        />
      )}
    </>
  );
}
