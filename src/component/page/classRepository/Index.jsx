import { useEffect, useState } from "react";
import { API_LINK, PAGE_SIZE } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import SweetAlert from "../../util/SweetAlert";
import Search from "../../part/Search";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import CardClassTraining from "../../part/CardKelasTraining";
import Paging from "../../part/Paging";
import "../../../../src/index.css";
import AnimatedSection from "../../part/AnimatedSection";

const inisialisasiData = [
  {
    ID: null,
    Nama: null,
    "Nomor Telepon": null,
    Username: null,
    "Tanggal Klaim": null,
    Count: 0,
  },
];

export default function ClassRepositoryIndex({ onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [loadingStates, setLoadingStates] = useState({
    userData: true,
    programData: true,
    publikasiData: true,
    eksternalData: true,
    kategoriProgram: true,
  });
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentDataPublikasi, setCurrentDataPublikasi] =
    useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Program] desc",
    status: "",
  });

  const [currentFilterPublikasi, setCurrentFilterPublikasi] = useState({
    page: 1,
    query: "",
    sort: "[Nama Program] desc",
    status: "",
  });

  const [userData, setUserData] = useState({
    Role: "",
    Nama: "",
    kry_id: "",
  });

  const updateLoadingState = (key, value) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getUserKryID = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    updateLoadingState("userData", true);

    try {
      let data = await UseFetch(API_LINK + "Utilities/GetUserLogin", {
        param: activeUser,
      });

      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil data user.");
      } else {
        setUserData(data[0]);
        setCurrentFilter((prevFilter) => ({
          ...prevFilter,
          kry_id: data[0].kry_id,
        }));
      }
    } catch (error) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    } finally {
      updateLoadingState("userData", false);
    }
  };

  useEffect(() => {
    getUserKryID();
  }, []);

  const getKK = async () => {
    setIsError({ error: false, message: "" });
    updateLoadingState("programData", true);

    try {
      let data = await UseFetch(
        API_LINK + "Program/GetProgramAll",
        currentFilter
      );

      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil data Program.");
      } else {
        setCurrentData(data);
      }
    } catch (e) {
      setIsError({ error: true, message: e.message });
    } finally {
      updateLoadingState("programData", false);
    }
  };

  const getProgramPublikasi = async () => {
    setIsError({ error: false, message: "" });
    updateLoadingState("publikasiData", true);

    try {
      let data = await UseFetch(
        API_LINK + "Program/GetDataProgramTerpublikasi",
        currentFilterPublikasi
      );

      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil data Program.");
      } else {
        setCurrentDataPublikasi(data);
      }
    } catch (e) {
      setIsError({ error: true, message: e.message });
    } finally {
      updateLoadingState("publikasiData", false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getKK();
      await getProgramPublikasi();
    };

    fetchData();
  }, [currentFilter, currentFilterPublikasi]);

  function handleSetCurrentPage(newCurrentPage) {
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  function handleSetCurrentPagePublikasi(newCurrentPage) {
    setCurrentFilterPublikasi((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  function handleSetStatus(data, status) {
    setIsError(false);

    let message;

    if (data.Status === "Draft")
      message = "Apakah anda yakin ingin mempublikasikan data ini?";
    else if (data.Status === "Aktif")
      message = "Apakah anda yakin ingin menonaktifkan data ini?";
    else if (data.Status === "Tidak Aktif")
      message = "Apakah anda yakin ingin mengaktifkan data ini?";

    SweetAlert("Konfirmasi", message, "info", "Ya").then((confirm) => {
      if (confirm) {
        updateLoadingState("programData", true);
        UseFetch(API_LINK + "Program/SetStatusProgram", {
          idProgram: data.Key,
          status: status,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) {
              setIsError(true);
            } else if (data[0].hasil === "ERROR KATEGORI AKTIF") {
              setIsError({
                error: true,
                message:
                  "Terjadi kesalahan: Gagal menonaktifkan Program karena terdapat kategori berstatus Aktif.",
              });
            } else {
              let message;
              if (status === "Tidak Aktif") {
                message = "Data berhasil dinonaktifkan.";
              } else if (status === "Aktif") {
                message = "Sukses! Data berhasil dipublikasi.";
              }
              SweetAlert("Sukses", message, "success");
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .finally(() => updateLoadingState("programData", false));
      }
    });
  }

  return (
    <div className="app-container">
      <AnimatedSection>
        <Search
          title="Class Repository"
          description="ASTRAtech memiliki banyak program studi, di dalam program studi terdapat class repository dari Program Kelompok Keahlian yang dibuat."
          showInput={false}
        />
      </AnimatedSection>

      <>
        <AnimatedSection delay={0.3}>
          <div className="d-flex flex-column">
            <div className="flex-fill container">
              <div className="mt-4">
                <p className="title-kk">Class Training</p>
              </div>

              <>
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
                  ↓ Belum Dipublikasikan
                </div>

                <div className="d-flex flex-column">
                  <div className="flex-fill">
                    <div className="row">
                      {loadingStates.programData ? (
                        <div
                          className="d-flex justify-content-center align-items-center w-100"
                          style={{ minHeight: "200px" }}
                        >
                          <Loading />
                        </div>
                      ) : currentData[0]?.Message === "data kosong" ? (
                        <div className="">
                          <Alert type="warning" message="Tidak ada data!" />
                        </div>
                      ) : (
                        (() => {
                          const filteredData = currentData.filter(
                            (value) =>
                              value.Status === "Aktif" &&
                              value.Publikasi != "Terpublikasi"
                          );

                          if (filteredData.length === 0) {
                            return (
                              <div className="">
                                <Alert
                                  type="warning"
                                  message="Tidak ada data yang belum terpublikasi!"
                                />
                              </div>
                            );
                          }

                          return filteredData.map((value, index) => (
                            <div key={index} className="col-12 col-md-4 mb-4">
                              <CardClassTraining
                                data={{
                                  id: value.Key,
                                  title: value["Nama Program"],
                                  desc: value.Deskripsi,
                                  status: value.Status,
                                  gambar: value.Gambar,
                                  ProgramStudi: value.ProgramStudi,
                                  harga: value.Harga,
                                  publikasi: value.Publikasi,
                                }}
                                onChangePage={onChangePage}
                                onChangeStatus={handleSetStatus}
                              />
                            </div>
                          ));
                        })()
                      )}
                    </div>
                  </div>
                </div>

                {currentData[0]?.ID !== null &&
                  currentData.filter(
                    (value) =>
                      value.Status === "Aktif" &&
                      value.Publikasi != "Terpublikasi"
                  ).length > 0 && (
                    <div className="mb-4 d-flex justify-content-center">
                      <div className="d-flex flex-column">
                        <Paging
                          pageSize={PAGE_SIZE}
                          pageCurrent={currentFilter.page}
                          totalData={currentData[0]?.Count || 0}
                          navigation={handleSetCurrentPage}
                        />
                      </div>
                    </div>
                  )}
              </>

              <>
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
                  ↓ Terpublikasi
                </div>

                <div className="d-flex flex-column">
                  <div className="flex-fill">
                    <div className="row">
                      {loadingStates.publikasiData ? (
                        <div
                          className="d-flex justify-content-center align-items-center w-100"
                          style={{ minHeight: "200px" }}
                        >
                          <Loading />
                        </div>
                      ) : currentDataPublikasi[0]?.Message === "data kosong" ? (
                        <div className="" style={{ margin: "5px 20px" }}>
                          <Alert type="warning" message="Tidak ada data!" />
                        </div>
                      ) : (
                        currentDataPublikasi
                          .filter(
                            (value) =>
                              value.Status === "Aktif" &&
                              value.Publikasi === "Terpublikasi"
                          )
                          .map((value, index) => (
                            <div key={index} className="col-12 col-md-4 mb-4">
                              <CardClassTraining
                                data={{
                                  id: value.Key,
                                  title: value["Nama Program"],
                                  desc: value.Deskripsi,
                                  status: value.Status,
                                  gambar: value.Gambar,
                                  ProgramStudi: value.ProgramStudi,
                                  harga: value.Harga,
                                  publikasi: value.Publikasi,
                                }}
                                onChangePage={onChangePage}
                                onChangeStatus={handleSetStatus}
                              />
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </>

              <div className="mb-4 d-flex justify-content-center">
                <div className="d-flex flex-column">
                  <Paging
                    pageSize={PAGE_SIZE}
                    pageCurrent={currentFilterPublikasi.page}
                    totalData={currentDataPublikasi[0]?.Count || 0}
                    navigation={handleSetCurrentPagePublikasi}
                  />
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </>
    </div>
  );
}
