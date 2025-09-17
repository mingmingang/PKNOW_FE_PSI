import { useEffect, useRef, useState } from "react";
import UseFetch from "../../../util/UseFetch";
import Input from "../../../part/Input";
import Filter from "../../../part/Filter";
import DropDown from "../../../part/Dropdown";
import { API_LINK } from "../../../util/Constants";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import CardPengajuanBaru from "../../../part/CardPengajuanBaru";
import Alert from "../../../part/Alert";
import "../../../../index.css";
import Button2 from "../../../part/Button copy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap, faUser } from "@fortawesome/free-solid-svg-icons";
import "../../../../../src/index.css";
import "../../../../style/Search.css";

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

const inisialisasiKK = [
  {
    Key: null,
    No: null,
    Nama: null,
    PIC: null,
    Deskripsi: null,
    Status: "Aktif",
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Nama Kelompok Keahlian] asc", Text: "Nama Kelompok Keahlian [↑]" },
  {
    Value: "[Nama Kelompok Keahlian] desc",
    Text: "Nama Kelompok Keahlian  [↓]",
  },
];

export default function PengajuanKelompokKeahlian({ onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const [hasSearched, setHasSearched] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  function handleSearch() {
    setHasSearched(true);
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: 1,
        query: searchQuery.current.value,
        sort: searchFilterSort.current.value,
      };
    });
  }

  const [isError, setIsError] = useState(false);
  const [dataAktif, setDataAktif] = useState(false);
  const [listKK, setListKK] = useState(inisialisasiKK);
  const [detail, setDetail] = useState(inisialisasiData);
  const [listNamaFile, setListNamaFile] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [userData, setUserData] = useState({
    Role: "",
    Nama: "",
    kry_id: "",
  });

  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Kelompok Keahlian] ASC",
    kry_id: "",
  });

  const getUserKryID = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Utilities/GetUserLogin", {
          param: activeUser,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar prodi.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setUserData(data[0]);
          setCurrentFilter((prevFilter) => ({
            ...prevFilter,
            kry_id: data[0].kry_id,
          }));
          break;
        }
      }
    } catch (error) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    }
  };

  useEffect(() => {
    getUserKryID();
  }, []);

  const filterUniqueKK = (data) => {
    let waitingAccCount = 0;
    const uniqueKK = data.reduce((acc, current) => {
      const existing = acc.find((item) => item["ID KK"] === current["ID KK"]);

      if (!existing) {
        acc.push(current);
        if (current.Status === "Menunggu Acc") {
          waitingAccCount++;
        }
      } else {
        if (current.Status === "Aktif") {
          acc = acc.map((item) =>
            item["ID KK"] === current["ID KK"] ? current : item
          );
        } else if (
          current.Status === "Menunggu Acc" &&
          existing.Status !== "Aktif" &&
          waitingAccCount < 2
        ) {
          acc = acc.map((item) =>
            item["ID KK"] === current["ID KK"] ? current : item
          );
          waitingAccCount++;
        }
      }

      return acc;
    }, []);

    return uniqueKK;
  };

  const getDataKKStatusByUser = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    if (currentFilter.kry_id === "") return;

    try {
      let data = await UseFetch(
        API_LINK + "PengajuanKK/GetAnggotaKK",
        currentFilter
      );

      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil daftar prodi.");
      } else if (data.length === 0) {
        setListKK([]);
        setIsEmpty(true);
      } else {
        const formattedData = data.map((value) => {
          if (value.Status === "Ditolak" || value.Status === "Dibatalkan") {
            return { ...value, Status: "Kosong" };
          }
          return value;
        });

        const uniqueData = filterUniqueKK(formattedData);

        const waitingCount = uniqueData.filter(
          (value) => value.Status === "Menunggu Acc"
        ).length;

        const finalData = uniqueData.map((value) => {
          if (waitingCount === 2 && value.Status !== "Menunggu Acc") {
            return { ...value, Status: "None" };
          }
          return value;
        });

        setListKK(finalData);
        setIsEmpty(finalData.length === 0);
      }
    } catch (error) {
      setListKK([]);
      setIsEmpty(true);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDataKKStatusByUser();
  }, [currentFilter]);

  const getDataAktif = (data) => {
    return data.find((value) => value.Status === "Aktif");
  };

  useEffect(() => {
    setDataAktif(getDataAktif(listKK));
  }, [listKK]);

  useEffect(() => {
    if (dataAktif) {
      const formattedData = listKK.map((value) => {
        if (value.Status === "Kosong") return { ...value, Status: "None" };
        return value;
      });
      setListKK(formattedData);
    }
  }, [dataAktif]);

  const decodeHtmlEntities = (str) => {
    const parser = new DOMParser();
    const decodedString = parser.parseFromString(str, "text/html").body
      .textContent;
    return decodedString || str;
  };

  const getLampiran = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    setIsLoading(true);

    try {
      let data = await UseFetch(API_LINK + "PengajuanKK/GetDetailLampiran", {
        page: 1,
        sort: "[ID Lampiran] ASC",
        akk_id: dataAktif.Key,
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
      setDetail(null);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dataAktif) getLampiran();
  }, [dataAktif]);

  return (
    <>
      <div className="app-container">
        <main>
          <div className="backSearch">
            <h1>Pengajuan Anggota Keahlian</h1>
            <p>
              ASTRAtech memiliki banyak program studi, di dalam program studi
              terdapat kelompok keahlian yang biasa disebut dengan Kelompok
              Keahlian
            </p>
            <div className="input-wrapper">
              <div
                className="cari"
                style={{
                  display: "flex",
                  backgroundColor: "white",
                  borderRadius: "20px",
                  height: "40px",
                }}
              >
                <Input
                  ref={searchQuery}
                  forInput="pencarianKK"
                  placeholder="Cari Kelompok Keahlian"
                  style={{
                    border: "none",
                    height: "40px",
                    borderRadius: "20px",
                  }}
                />
                <Button2
                  iconName="search"
                  classType="px-4"
                  title="Cari"
                  onClick={handleSearch}
                  style={{ backgroundColor: "transparent", color: "#08549F" }}
                />
              </div>
            </div>
          </div>

          <div className="container">
            <div className="navigasi-layout-page">
              <p className="title-kk">Kelompok Keahlian</p>
              <div className="left-feature">
                <div className="status" style={{ display: "flex" }}>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <i
                            className="fas fa-circle"
                            style={{ color: "#FFC107" }}
                          ></i>
                        </td>
                        <td>
                          <p>Menunggu Persetujuan Prodi</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="" style={{ marginLeft: "20px" }}>
                    <Filter handleSearch={handleSearch}>
                      <DropDown
                        ref={searchFilterSort}
                        forInput="ddUrut"
                        label="Urut Berdasarkan"
                        type="none"
                        arrData={dataFilterSort}
                        defaultValue="[Nama Kelompok Keahlian] asc"
                      />
                    </Filter>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {hasSearched && isEmpty && !isLoading && (
            <div className="container">
              <Alert
                type="warning mt-3"
                message="Tidak ada data! Silahkan cari kelompok keahlian diatas.."
              />
            </div>
          )}

          {isLoading ? (
            <div className="container">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="d-flex flex-column container">
              {dataAktif ? (
                <div className="flex-fill">
                  <div
                    className="text-white fw-medium mb-4"
                    style={{
                      padding: "10px",
                      backgroundColor: "#0E6EFE",
                      borderRadius: "10px",
                    }}
                  >
                    ↓ Terdaftar sebagai anggota keahlian
                  </div>
                  <div className="card">
                    <div className="card-body p-3">
                      <div className="row">
                        <div className="col-lg-7 pe-4">
                          <img
                            src={`${API_LINK}Upload/GetFile/${dataAktif["Gambar"]}`}
                            alt=""
                            style={{
                              width: "100%",
                              borderRadius: "20px",
                              marginBottom: "20px",
                            }}
                          />
                          <h3
                            className="mb-3 fw-semibold"
                            style={{ color: "#0A5EA8" }}
                          >
                            {dataAktif["Nama Kelompok Keahlian"]}
                          </h3>
                          <h5 className="fw-semibold mb-4">
                            <FontAwesomeIcon
                              icon={faUser}
                              className="icon-style mr-2"
                            />
                            PIC : {dataAktif?.PIC}
                          </h5>
                          <h5 className="fw-semibold">
                            <FontAwesomeIcon
                              icon={faGraduationCap}
                              className="icon-style mr-2"
                            />
                            {dataAktif?.Prodi}
                          </h5>
                          <p
                            className="pt-3"
                            style={{
                              textAlign: "justify",
                            }}
                          >
                            {dataAktif?.Deskripsi}
                          </p>
                        </div>
                        <div className="col-lg-5 ps-4 border-start">
                          <h5 className="fw-semibold mt-1">
                            Lampiran pendukung
                          </h5>
                          <div className=" ">
                            {detail?.map((item, index) => (
                              <div key={index}>
                                {item.Lampiran ? (
                                  Array.isArray(item.Lampiran) ? (
                                    item.Lampiran.map((link, linkIndex) => (
                                      <div key={linkIndex}>
                                        <h5
                                          className="mb-3"
                                          style={{ marginTop: "15px" }}
                                        >{`Lampiran ${linkIndex + 1}`}</h5>
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
                                            dataAktif["Nama Kelompok Keahlian"]
                                          }`}
                                        </a>
                                      </div>
                                    ))
                                  ) : typeof item.Lampiran === "string" ? (
                                    item.Lampiran.split(",").map(
                                      (link, linkIndex) => (
                                        <div key={linkIndex}>
                                          <h5 className="mb-3">{`Lampiran ${
                                            index + 1
                                          }`}</h5>
                                          <a
                                            href={link.trim()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            {`Lampiran ${linkIndex + 1} ${
                                              dataAktif[
                                                "Nama Kelompok Keahlian"
                                              ]
                                            }`}
                                          </a>
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <p>Invalid Lampiran format</p>
                                  )
                                ) : (
                                  <p>Tidak ada lampiran</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="text-white fw-medium mt-4 mb-4"
                    style={{
                      padding: "10px",
                      backgroundColor: "#A7AAAC",
                      borderRadius: "10px",
                    }}
                  >
                    ↓ Kelompok Keahlian Lainnya
                  </div>
                  <div className="card mb-4">
                    <div className="card-body p-3">
                      <div className="row mt-0 gx-4">
                        {listKK
                          ?.filter((value) => {
                            return (
                              value.Status !== "Aktif" &&
                              value.Status !== "Tidak Aktif"
                            );
                          })
                          .map((value, index) => (
                            <CardPengajuanBaru
                              key={index}
                              data={value}
                              onChangePage={onChangePage}
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {!isEmpty ? (
                    <div className="flex-fill">
                      <div className="container">
                        {listKK.filter(
                          (value) => value.Status === "Menunggu Acc"
                        ).length == 2 && (
                          <Alert
                            type="info mt-2"
                            message="Anda hanya bisa mendaftar pada 2 Kelompok Keahlian. Tunggu konfirmasi dari prodi.."
                          />
                        )}
                        <div
                          className="card-keterangan"
                          style={{
                            background: "#FFC107",
                            borderRadius: "5px",
                            padding: "10px 20px",
                            marginBottom: "20px",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          ↓ Menunggu Persetujuan Prodi
                        </div>
                        {listKK.filter(
                          (value) => value.Status === "Menunggu Acc"
                        ).length == 0 && (
                          <Alert
                            type="warning mt-2 "
                            message="Anda belum melakukan pengajuan"
                          />
                        )}
                        <div className="container row mt-3 gx-4">
                          {listKK
                            ?.filter((value) => {
                              return value.Status === "Menunggu Acc";
                            })
                            .map((value, index) => (
                              <CardPengajuanBaru
                                key={index}
                                data={value}
                                onChangePage={onChangePage}
                              />
                            ))}
                        </div>
                        <div
                          className="card-keterangan"
                          style={{
                            background: "#61A2DC",
                            borderRadius: "5px",
                            padding: "10px 20px",
                            marginBottom: "20px",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          ↓ Kelompok Keahlian Lainnya
                        </div>

                        {listKK.filter(
                          (value) =>
                            value.Status != "Menunggu Acc" &&
                            value.Status !== "Tidak Aktif"
                        ).length == 0 && (
                          <Alert
                            type="warning mt-2 mr-4 ml-4"
                            message="Belum ada kelompok Keahlian"
                          />
                        )}
                        <div className="container row mt-3 gx-4">
                          {listKK
                            ?.filter((value) => {
                              return value.Status !== "Menunggu Acc";
                            })
                            .map((value, index) => (
                              <CardPengajuanBaru
                                key={index}
                                data={value}
                                onChangePage={onChangePage}
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
