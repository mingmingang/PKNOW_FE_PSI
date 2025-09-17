import { useState, useEffect } from "react";
import Button from "../../../part/Button copy";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import { API_LINK } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import maskotPknow from "../../../../assets/pknowmaskot.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { decode } from "he";

export default function KKDetailPublish({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listAnggota, setListAnggota] = useState([]);
  const [listProgram, setListProgram] = useState([]);

  const [formData, setFormData] = useState({
    key: "",
    nama: "",
    programStudi: "",
    deskripsi: "",
  });

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
          kke_id: withID["ID KK"],
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
          KKid: withID["ID KK"],
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
        key: withID["ID KK"],
        nama: withID["Nama Kelompok Keahlian"],
        programStudi: withID.Prodi,
        deskripsi: withID.Deskripsi,
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
      <div className="container mb-4" style={{ marginTop: "100px" }}>
        <div className="card">
          <div className="card-body">
            <div className="row pt-2">
              <div className="col-lg-7 px-4">
                <img
                  src={`${API_LINK}Upload/GetFile/${withID["Gambar"]}`}
                  alt=""
                  style={{
                    width: "100%",
                    borderRadius: "20px",
                    marginBottom: "20px",
                  }}
                />
                <h3 className="mb-3 fw-semibold">{decode(formData.nama)}</h3>
                <h6 className="card-subtitle mt-1 mb-3">
                  <FontAwesomeIcon icon={faUser} className="icon-style mr-2" />
                  {withID.PIC}
                </h6>
                <h6 className="fw-semibold">
                  <span
                    className="bg-primary me-2"
                    style={{ padding: "2px" }}
                  ></span>
                  {formData.programStudi}
                </h6>
                <div className="pt-2 ps-2"></div>
                <hr className="mb-0" style={{ opacity: "0.2" }} />
                <p className="py-3" style={{ textAlign: "justify" }}>
                  {decode(formData.deskripsi)}
                </p>
              </div>
              <div className="col-lg-5">
                {listAnggota.length > 0 ? (
                  listAnggota[0].Message ? (
                    <p>Tidak Ada Anggota Aktif</p>
                  ) : (
                    <div>
                      {listAnggota.map((ag, index) => (
                        <div
                          className="card-profile mb-3 d-flex justify-content-between shadow-sm"
                          key={ag.Key}
                        >
                          <div className="d-flex w-100">
                            <p className="mb-0 px-1 py-2 mt-2 me-2 fw-bold text-primary">
                              {index + 1}
                            </p>
                            <div
                              className="bg-primary"
                              style={{ width: "1.5%" }}
                            ></div>
                            <div className="p-1 ps-2 d-flex">
                              <img
                                src={maskotPknow}
                                alt={ag["Nama Anggota"]}
                                className="img-fluid rounded-circle"
                                width="45"
                              />
                              <div className="ps-3">
                                <p className="mb-0">{ag["Nama Anggota"]}</p>
                                <p
                                  className="mb-0"
                                  style={{ fontSize: "13px" }}
                                >
                                  {ag.Prodi}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-end">
                        <Button
                          classType=" text-decoration-none px-3 mt-2"
                          type="submit"
                          label="Lihat Semua"
                          data-bs-toggle="modal"
                          data-bs-target="#modalAnggota"
                          style={{ backgroundColor: "#0A5EA8", color: "white" }}
                        />
                      </div>
                    </div>
                  )
                ) : (
                  <p>Tidak Ada Anggota Aktif</p>
                )}
              </div>
            </div>
            <h5 className="text-primary pt-2">
              Daftar Program dalam Kelompok Keahlian{" "}
              <strong>{decode(formData.nama)}</strong>
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
                        {decode(data["Nama Program"])}
                      </p>
                      <p
                        className="mb-0 pe-3"
                        style={{
                          width: "80%",
                        }}
                      >
                        {decode(data.Deskripsi)}
                      </p>
                    </div>
                    <div className="p-3 pt-0">
                      <p className="text-primary fw-semibold mb-0 mt-2">
                        Daftar Kategori Program
                      </p>
                      <div className="row row-cols-3">
                        {data.kategori.map((kat, indexKat) => (
                          <>
                            <div className="col">
                              <div className="card card-kategori-program mt-3">
                                <div className="card-body">
                                  <div className="d-flex justify-content-between">
                                    <h6 className="card-title">
                                      {index + 1}
                                      {"-"}
                                      {indexKat + 1}
                                      {". "}
                                      {decode(kat["Nama Kategori"])}
                                    </h6>
                                  </div>
                                  <div className="d-flex mt-2">
                                    <div className="me-2 bg-primary ps-1"></div>
                                    <p
                                      className="card-subtitle"
                                      style={{ textAlign: "justify" }}
                                    >
                                      {decode(kat.Deskripsi)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              <p>Tidak Ada Program</p>
            )}
          </div>
          <div className="float-end my-4 mx-1">
            <div className="d-flex justify-content-end">
              <Button
                classType="secondary me-2 px-4 py-2"
                label="Kembali"
                onClick={() => onChangePage("index")}
              />
            </div>
          </div>
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
              <h1 className="modal-title fs-5" id="modalAnggotaKK">
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
                      className="card-profile mb-3 d-flex justify-content-between shadow-sm"
                      key={ag.Key}
                    >
                      <div className="d-flex w-100">
                        <p className="mb-0 px-1 py-2 mt-2 me-2 fw-bold text-primary">
                          {index + 1}
                        </p>
                        <div
                          className="bg-primary"
                          style={{ width: "1.5%" }}
                        ></div>
                        <div className="p-1 ps-2 d-flex">
                          <img
                            src={maskotPknow}
                            alt={ag["Nama Anggota"]}
                            className="img-fluid rounded-circle"
                            width="45"
                          />
                          <div className="ps-3">
                            <p className="mb-0">{ag["Nama Anggota"]}</p>
                            <p className="mb-0" style={{ fontSize: "13px" }}>
                              {ag.Prodi}
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
    </>
  );
}
