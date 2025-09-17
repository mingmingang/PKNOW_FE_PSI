import { useState, useEffect } from "react";
import Button from "../../../part/Button copy";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import Icon from "../../../part/Icon";
import { API_LINK } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import BackPage from "../../../../assets/backPage.png";
import Konfirmasi from "../../../part/Konfirmasi";
import pknowMaskot from "../../../../assets/pknowmaskot.png";
import { decode } from "html-entities";
import "../../../../style/DetailKK.css";

export default function KKDetailProgram({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listAnggota, setListAnggota] = useState([]);
  const [listProgram, setListProgram] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);

  const [formData, setFormData] = useState({
    key: "",
    nama: "",
    programStudi: "",
    personInCharge: "",
    deskripsi: "",
    status: "",
    members: [],
    memberCount: "",
  });

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

  const getListAnggota = async () => {
    setIsError({ error: false, message: "" });
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "AnggotaKK/GetAnggotaKK", {
          page: 1,
          query: "",
          sort: "[Nama Anggota] asc",
          status: "Aktif",
          kke_id: withID.Key,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar anggota.");
        } else if (data === "data kosong") {
          setListAnggota([]);
          setIsLoading(false);
          break;
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setListAnggota(data);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  const getListProgram = async () => {
    setIsError({ error: false, message: "" });
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Program/GetProgram", {
          page: 1,
          query: "",
          sort: "[Nama Program] ASC",
          status: "Aktif",
          KKid: withID.Key,
        });
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data program.");
        } else if (data === "data kosong") {
          setListProgram([]);
          setIsLoading(false);
          break;
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          const updatedListProgram = await Promise.all(
            data.map(async (program) => {
              try {
                while (true) {
                  let data = await UseFetch(
                    API_LINK + "KategoriProgram/GetKategoriByProgram",
                    {
                      page: 1,
                      query: "",
                      sort: "[Nama Kategori] asc",
                      status: "Aktif",
                      kkeID: program.Key,
                    }
                  );

                  if (data === "ERROR") {
                    throw new Error(
                      "Terjadi kesalahan: Gagal mengambil data kategori."
                    );
                  } else if (data === "data kosong") {
                    return { ...program, kategori: [] };
                  } else if (data.length === 0) {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                  } else {
                    return { ...program, kategori: data };
                  }
                }
              } catch (e) {
                setIsError({ error: true, message: e.message });
                return { ...program, kategori: [] };
              }
            })
          );

          setListProgram(updatedListProgram);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      setIsError({ error: true, message: e.message });
    }
  };

  useEffect(() => {
    if (withID) {
      setFormData({
        key: withID.Key,
        nama: withID["Nama Kelompok Keahlian"],
        programStudi: withID["Prodi"],
        personInCharge: withID["PIC"],
        deskripsi: withID["Deskripsi"],
        status: withID["Status"],
      });
      getListAnggota();
      getListProgram();
    }
  }, [withID]);

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div className="detail-kk-pickk">
        <div className="container d-flex">
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
            Detail Kelompok Keahlian
          </h4>
        </div>
      </div>
      <div className="container card mb-4">
        <div className="card-body">
          <div className="row pt-2">
            <div className="col-lg-7 px-4">
              <h3 className="mb-3 fw-semibold">
                {formData && formData.nama
                  ? decode(formData.nama)
                  : "Nama tidak tersedia"}
              </h3>
              <h6 className="fw-semibold">
                <span
                  className="bg-primary me-2"
                  style={{ padding: "2px" }}
                ></span>
                {formData && formData.programStudi
                  ? decode(formData.programStudi)
                  : "Program Studi tidak tersedia"}
              </h6>
              <div className="pt-2 ps-2">
                <Icon
                  name="user"
                  cssClass="p-0 ps-1 text-dark"
                  title="PIC Kelompok Keahlian"
                />{" "}
                <span>
                  PIC :{" "}
                  {formData && formData.personInCharge
                    ? decode(formData.personInCharge)
                    : "Person In Charge tidak tersedia"}
                </span>
              </div>
              <hr className="mb-0" style={{ opacity: "0.2" }} />
              <p className="py-3" style={{ textAlign: "justify" }}>
                {formData && formData.deskripsi
                  ? decode(formData.deskripsi)
                  : "Deskripsi tidak tersedia"}
              </p>
            </div>
            <div className="col-lg-5">
              {listAnggota.length > 0 ? (
                listAnggota[0].Message ? (
                  <p>Tidak Ada Anggota Aktif</p>
                ) : (
                  <div>
                    {listAnggota.slice(0, 3).map((ag, index) => (
                      <div
                        className="card-profile mb-3 d-flex justify-content-between shadow-sm rounded-3"
                        key={ag.Key}
                      >
                        <div className="d-flex w-100">
                          <p
                            className="mb-0 px-1 py-2 mt-2 me-2 fw-bold "
                            style={{ color: "#0A5EA8" }}
                          >
                            {index + 1}
                          </p>
                          <div className="p-1 ps-2 d-flex">
                            <img
                              src={pknowMaskot}
                              alt={ag["Nama Anggota"]}
                              className="img-fluid rounded-circle"
                              width="45"
                            />
                            <div className="ps-3" style={{ color: "#0A5EA8" }}>
                              <p className="mb-0 fw-bold">
                                {ag && ag["Nama Anggota"]
                                  ? decode(ag["Nama Anggota"])
                                  : "Nama Anggota tidak tersedia"}
                              </p>
                              <p className="mb-0" style={{ fontSize: "13px" }}>
                                {ag && ag.Prodi
                                  ? decode(ag.Prodi)
                                  : "Prodi tidak tersedia"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-end">
                      <Button
                        classType="text-decoration-none px-3 mt-2"
                        style={{ color: "white", backgroundColor: "#0A5EA8" }}
                        type="submit"
                        label="Lihat Semua"
                        data-bs-toggle="modal"
                        data-bs-target="#modalAnggota"
                      />
                    </div>
                  </div>
                )
              ) : (
                <p>Tidak Ada Anggota Aktif</p>
              )}
            </div>
          </div>
          <h5 className="pt-2" style={{ color: "#0A5EA8" }}>
            Daftar Program dalam Kelompok Keahlian{" "}
            <strong>
              {formData && formData.nama
                ? decode(formData.nama)
                : "Nama tidak tersedia"}
            </strong>
          </h5>
          {listProgram.length > 0 ? (
            listProgram[0].Message ? (
              <p>Tidak Ada Program</p>
            ) : (
              listProgram.map((data, index) => (
                <div
                  key={data.Key}
                  className="card card-program mt-3 border-secondary"
                >
                  <div className="card-body d-flex justify-content-between align-items-center border-bottom border-secondary">
                    <p className="fw-medium mb-0" style={{ width: "20%" }}>
                      {index + 1}
                      {". "}
                      {data && data["Nama Program"]
                        ? decode(data["Nama Program"])
                        : "Nama Program tidak tersedia"}
                    </p>
                    <p
                      className="mb-0 pe-3"
                      style={{
                        width: "80%",
                      }}
                    >
                      {data && data.Deskripsi
                        ? decode(data.Deskripsi)
                        : "Deskripsi tidak tersedia"}
                    </p>
                  </div>
                  <div className="p-3 pt-0">
                    <p className="text-primary fw-semibold mb-0 mt-2">
                      Daftar Kategori Program
                    </p>
                    <div className="row row-cols-3">
                      {data.kategori.map((kat, indexKat) => {
                        let deskripsiSingkat = "Deskripsi tidak tersedia";

                        if (kat && kat.Deskripsi) {
                          const deskripsiLengkap = decode(kat.Deskripsi);

                          if (deskripsiLengkap.length > 150) {
                            deskripsiSingkat =
                              deskripsiLengkap.slice(0, 150) + "...";
                          } else {
                            deskripsiSingkat = deskripsiLengkap;
                          }
                        }
                        return (
                          <div className="col" key={indexKat}>
                            {" "}
                            <div className="card card-kategori-program mt-3">
                              <div className="card-body">
                                <div className="d-flex justify-content-between">
                                  <h6 className="card-title">
                                    {index + 1}-{indexKat + 1}.{" "}
                                    {kat && kat["Nama Kategori"]
                                      ? decode(kat["Nama Kategori"])
                                      : "Nama Kategori tidak tersedia"}
                                  </h6>
                                </div>
                                <div className="d-flex mt-2">
                                  <div className="me-2 bg-primary ps-1"></div>
                                  <p
                                    className="card-subtitle"
                                    style={{ textAlign: "justify" }}
                                  >
                                    {deskripsiSingkat}{" "}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            <p>Tidak Ada Program</p>
          )}
        </div>
      </div>
      <div
        className="modal fade"
        id="modalAnggota"
        tabindex="-1"
        aria-labelledby="Anggota Kelompok Keahlian"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1
                className="modal-title fs-5"
                id="modalAnggotaKK"
                style={{ color: "#0A5EA8" }}
              >
                Anggota Kelompok Keahlian
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
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
                        <p className="mb-0 px-1 py-2 mt-2 me-2 fw-bold text-primary">
                          {index + 1}
                        </p>
                        <div className="p-1 ps-2 d-flex">
                          <img
                            src={pknowMaskot}
                            alt={ag["Nama Anggota"]}
                            className="img-fluid rounded-circle"
                            width="45"
                          />
                          <div className="ps-3" style={{ color: "#0A5EA8" }}>
                            <p className="mb-0 fw-bold">
                              {ag && ag["Nama Anggota"]
                                ? decode(ag["Nama Anggota"])
                                : "Nama Anggota tidak tersedia"}
                            </p>
                            <p className="mb-0" style={{ fontSize: "13px" }}>
                              {ag && ag.Prodi
                                ? decode(ag.Prodi)
                                : "Prodi tidak tersedia"}
                            </p>
                          </div>
                        </div>
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
