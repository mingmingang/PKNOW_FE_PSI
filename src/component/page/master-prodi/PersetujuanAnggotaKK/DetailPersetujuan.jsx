import Search from "../../../part/Search";
import { useState, useEffect } from "react";
import UseFetch from "../../../util/UseFetch";
import { API_LINK } from "../../../util/Constants";
import "../../../../style/DetailPersetujuan.css";
import Button from "../../../part/Button copy";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import Label from "../../../part/Label";
import SweetAlert from "../../../util/SweetAlert";
import maskotPknow from "../../../../assets/pknowmaskot.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { decode } from "he";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "ID Lampiran": null,
    Lampiran: null,
    Karyawan: null,
    Status: null,
    Count: 0,
  },
];

export default function DetailPersetujuan({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [karyawan, setKaryawan] = useState([]);
  const [listAnggota, setListAnggota] = useState([]);
  const [listNamaFile, setListNamaFile] = useState([]);
  const [detail, setDetail] = useState(inisialisasiData);

  useEffect(() => {
    if (withID) {
      setFormData(withID);
    }
  }, [withID]);

  const getListAnggota = async (idKK) => {
    try {
      while (true) {
        let data = await UseFetch(API_LINK + "AnggotaKK/GetAnggotaKK", {
          page: 1,
          query: "",
          sort: "[Nama Anggota] ASC",
          status: "",
          kke_id: idKK,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar anggota.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setListAnggota(data);
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

  useEffect(() => {
    if (formData.Key) {
      getListAnggota(formData.Key);
    }
  }, [formData]);

  const decodeHtmlEntities = (str) => {
    const parser = new DOMParser();
    const decodedString = parser.parseFromString(str, "text/html").body
      .textContent;
    return decodedString || str;
  };

  const getListLampiran = async (idAKK) => {
    setIsError((prevError) => ({ ...prevError, error: false }));

    try {
      let data = await UseFetch(API_LINK + "PengajuanKK/GetDetailLampiran", {
        p1: 1,
        p2: "[ID Lampiran] ASC",
        p3: idAKK,
      });

      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil Detail Lampiran.");
      } else if (data.length === 0) {
        setListNamaFile([]);
      } else {
        const updatedData = data.map((item) => {
          if (item.Lampiran) {
            try {
              const cleanedLampiran = decodeHtmlEntities(item.Lampiran);

              const parsedLampiran = JSON.parse(cleanedLampiran);

              const fileUrls = parsedLampiran.map((file) => {
                return `${API_LINK}Upload/GetFile/${file.pus_file}`;
              });
              return { ...item, Lampiran: fileUrls };
            } catch (err) {
              return { ...item, Lampiran: [] };
            }
          }
          return item;
        });
        setDetail(updatedData);
      }
    } catch (error) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
      setDetail(null);
    }
  };

  function handleDetailLampiran(data) {
    getListLampiran(data.Key);
    setKaryawan(data);
  }

  function handleBatalkan() {
    setKaryawan({});
    setDetail([]);
  }

  function handleSetStatus(data, status) {
    setIsError(false);

    let message;

    if (status === "Aktif") message = "Apakah anda yakin ingin menyetujui?";
    else if (status === "Ditolak") message = "Apakah anda yakin ingin menolak?";

    SweetAlert("Konfirmasi", message, "info", "Ya").then((confirm) => {
      if (confirm) {
        setIsLoading(true);
        UseFetch(API_LINK + "AnggotaKK/SetStatusAnggotaKK", {
          idKK: data.Key,
          status: status,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else {
              let message;
              if (status === "Aktif") {
                message =
                  "Sukses! Karyawan berhasil menjadi anggota keahlian..";
              } else if (status === "Ditolak") {
                message = "Berhasil. Karyawan telah ditolak..";
              }
              SweetAlert("Sukses", message, "success");
              onChangePage("index");
            }
          })
          .then(() => setIsLoading(false));
      }
    });
  }

  if (isLoading) return <Loading />;

  return (
    <>
      <div className="app-container">
        <main>
          <Search
            title="Persetujuan Anggota Keahlian"
            description="Program Studi dapat menyetujui persetujuan pengajuan anggota keahlian yang diajukan oleh Tenaga Pendidik untuk menjadi anggota dalam Kelompok Keahlian. Program Studi dapat melihat lampiran pengajuan dari Tenaga Pendidik untuk menjadi bahan pertimbangan"
            placeholder="Cari Kelompok Keahlian"
            showInput={false}
          />
          <>
            {isError.error && (
              <div className="flex-fill">
                <Alert type="danger" message={isError.message} />
              </div>
            )}
            {isLoading ? (
              <Loading />
            ) : (
              <div className="cards">
                <div className="container card mb-3 mt-2">
                  <div className="row pt-3">
                    <div className="col-lg-6 px-4 ml-3 containerImg">
                      <h3
                        className="mb-3 fw-semibold"
                        style={{ fontSize: "50px", color: "#0A5EA8" }}
                      >
                        {decode(
                          String(
                            formData?.["Nama Kelompok Keahlian"] ||
                              "Data belum tersedia"
                          )
                        )}
                      </h3>
                      <h5 className="fw-semibold">
                        <FontAwesomeIcon
                          icon={faGraduationCap}
                          className="icon-style"
                          style={{ marginRight: "10px" }}
                        />
                        {formData.Prodi}
                      </h5>
                      <h4 className="fw-semibold" style={{ marginTop: "30px" }}>
                        Tentang Kelompok Keahlian
                      </h4>
                      <p
                        className="py-2 textPargraf"
                        style={{ textAlign: "justify" }}
                      >
                        {decode(
                          String(
                            formData?.["Deskripsi"] || "Data belum tersedia"
                          )
                        )}
                      </p>
                      <div className="">
                        <i className="fas fa-user"></i>
                        <span
                          style={{ marginLeft: "10px", fontWeight: "bold" }}
                        >
                          PIC : {formData.PIC}
                        </span>
                      </div>
                    </div>
                    <div className="col-lg-1">
                      <img
                        className="cover-daftar-kk"
                        src={`${API_LINK}Upload/GetFile/${formData.Gambar}`}
                        style={{
                          borderRadius: "20px",
                          objectFit: "",
                          border: "1px solid #ccc",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="row pt-2">
                      <div className="col-lg-5">
                        {listAnggota
                          ?.filter((value) => {
                            return value.Status === "Aktif";
                          })
                          .map((pr, index) => (
                            <>
                              <div className="card-profile mb-2 d-flex shadow-sm rounded-4">
                                <p
                                  className="text"
                                  style={{ color: "#0A5EA8" }}
                                >
                                  {index + 1}
                                </p>
                                <div className="p-1 ps-2 d-flex">
                                  <img
                                    src={maskotPknow}
                                    alt={pr["Nama Anggota"]}
                                    className="img-fluid rounded-circle"
                                    width="45"
                                  />
                                  <div
                                    className="ps-3"
                                    style={{ color: "#0A5EA8" }}
                                  >
                                    <p className="mb-0 fw-bold">
                                      {pr["Nama Anggota"]}
                                    </p>
                                    <p
                                      className="mb-0"
                                      style={{ fontSize: "13px" }}
                                    >
                                      {pr.Prodi}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="container card mb-3">
                  <div
                    className="fw-bold ml-3 mt-4 d-flex"
                    style={{
                      justifyContent: "space-between",
                      marginRight: "20px",
                    }}
                  >
                    <span style={{ fontSize: "25px", color: "#0A5EA8" }}>
                      Menunggu Persetujuan
                    </span>
                    <h6
                      className="mb-3 mt-3 d-flex fw-bold"
                      style={{ color: "#0A5EA8" }}
                    >
                      {
                        listAnggota?.filter((value) => {
                          return value.Status === "Menunggu Acc";
                        }).length
                      }{" "}
                      Tenaga Pendidik Menunggu Persetujuan
                    </h6>
                  </div>

                  <div className="card-body">
                    <div className="row">
                      {listAnggota?.filter(
                        (value) => value.Status === "Menunggu Acc"
                      ).length === 0 && (
                        <>
                          <div className="mr-1">
                            <Alert
                              type="warning mt-2 ml-1 mr-2"
                              message="Belum ada Tenaga Pendidik yang melakukan pengajuan.."
                            />
                          </div>
                        </>
                      )}

                      {listAnggota
                        ?.filter((value) => value.Status === "Menunggu Acc")
                        .map((value, index) => (
                          <div className="col-lg-6 mb-4" key={value.Key}>
                            <div>
                              <h6 className="fw-semibold mb-3">{value.Text}</h6>
                              <div className="card-profile mb-3 d-flex justify-content-between shadow-sm rounded-4">
                                <div className="d-flex w-100">
                                  <p className="mb-0 px-1 py-2 mt-2 me-2 fw-bold text-primary ml-3">
                                    {index + 1}
                                  </p>
                                  <div className="p-1 ps-2 d-flex">
                                    <img
                                      src={maskotPknow}
                                      alt={value["Nama Anggota"]}
                                      className="img-fluid rounded-circle"
                                      width="45"
                                    />
                                    <div className="ps-3">
                                      <p className="mb-0 fw-semibold">
                                        {value["Nama Anggota"]}
                                      </p>
                                      <p
                                        className="mb-0"
                                        style={{ fontSize: "13px" }}
                                      >
                                        {value.Prodi}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className="d-flex align-items-center"
                                  style={{ gap: "10px" }}
                                >
                                  <Button
                                    classType="light btn-sm text-primary px-3 mx-1"
                                    iconName="list"
                                    title="Lihat Detail Pengajuan"
                                    onClick={() => handleDetailLampiran(value)}
                                  />
                                  <Button
                                    classType="light btn-sm px-3 mx-1"
                                    iconName="check"
                                    title="Konfirmasi"
                                    style={{ color: "#00BF29" }}
                                    onClick={() =>
                                      handleSetStatus(value, "Aktif")
                                    }
                                  />
                                  <Button
                                    classType="light btn-sm text-danger px-3 mx-1"
                                    iconName="x"
                                    title="Tolak"
                                    onClick={() =>
                                      handleSetStatus(value, "Ditolak")
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {karyawan.Key && (
                  <div className="container card mb-3 ">
                    <div className="col-lg-20">
                      <h3
                        className="col-6 mb-3 mt-3 fw-bold"
                        style={{ color: "#0A5EA8", fontSize: "25px" }}
                      >
                        Detail pengajuan dan lampiran pendukung
                      </h3>
                      <div className="">
                        <div className="col-6">
                          <Label
                            title="Nama"
                            data={karyawan?.["Nama Anggota"] || "-"}
                          />
                        </div>
                        <div className="col-6">
                          <Label
                            title="Program Studi"
                            data={karyawan?.["Prodi"] || "-"}
                          />
                        </div>
                        <div className="mt-2 col-6">
                          {detail?.map((item, index) => (
                            <div key={index}>
                              {item.Lampiran ? (
                                Array.isArray(item.Lampiran) ? (
                                  item.Lampiran.map((link, linkIndex) => (
                                    <div
                                      key={linkIndex}
                                      style={{ marginTop: "15px" }}
                                    >
                                      <p className="mb-3 fw-bold">{`Lampiran ${
                                        linkIndex + 1
                                      }`}</p>
                                      <a
                                        href={link.trim()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          padding: "5px",
                                          marginTop: "20px",
                                          textDecoration: "none",
                                          borderRadius: "10px",
                                          color: "white",
                                          backgroundColor: "#0A5EA8",
                                        }}
                                      >
                                        {`Lampiran ${linkIndex + 1} ${
                                          withID["Nama Kelompok Keahlian"]
                                        }`}
                                      </a>
                                    </div>
                                  ))
                                ) : (
                                  <p>Invalid Lampiran format</p>
                                )
                              ) : (
                                <p>Tidak ada lampiran</p>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="d-flex justify-content-between ml-3 mr-3 mt-5 mb-3">
                          <Button
                            classType="secondary btn-sm px-3 py-2 rounded-3"
                            label="Batalkan"
                            style={{
                              height: "50px",
                              backgroundColor: "#5A5A5A",
                            }}
                            onClick={handleBatalkan}
                          />
                          <div className="d-flex text-end">
                            <div className="mr-2">
                              <Button
                                classType="primary btn-sm px-3 mx-1 py-2"
                                iconName="check"
                                label="Konfirmasi"
                                onClick={() =>
                                  handleSetStatus(karyawan, "Aktif")
                                }
                              />
                            </div>
                            <div className="">
                              <Button
                                classType="danger btn-sm px-3 mx-1 py-2"
                                iconName="x"
                                label="Tolak"
                                style={{ backgroundColor: "red" }}
                                onClick={() =>
                                  handleSetStatus(karyawan, "Ditolak")
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="container">
                  <Button
                    style={{
                      marginBottom: "80px",
                      marginTop: "20px",
                      backgroundColor: "#5A5A5A",
                    }}
                    classType="secondary me-2 px-4 py-2"
                    label="Kembali"
                    onClick={() => onChangePage("index")}
                  />
                </div>
              </div>
            )}
          </>
        </main>
      </div>
    </>
  );
}
