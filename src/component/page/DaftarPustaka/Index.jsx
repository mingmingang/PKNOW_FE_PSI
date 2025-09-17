import { useEffect, useRef, useState } from "react";
import ButtonPro from "../../part/Button copy";
import "../../../../src/index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Input from "../../part/Input";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import CardPustaka from "../../part/CardPustaka";
import { API_LINK, PAGE_SIZE } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import SweetAlert from "../../util/SweetAlert";
import Paging from "../../part/Paging";
import { decode } from "he";
import Konfirmasi from "../../part/Konfirmasi";
import AnimatedSection from "../../part/AnimatedSection";

export default function DaftarPustaka({ onChangePage, withID }) {
  let activeUser = "";
  let activerole = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  if (cookie) activerole = JSON.parse(decryptId(cookie)).role;

  const [listKKE, setListKKE] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [currentDataMilikSaya, setCurrentDataMilikSaya] = useState([]);
  const [listKK, setListKK] = useState([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);

  const handleConfirmYes = () => {
    setShowConfirmation(false);
    onChangePage("kk", withID);
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };

  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Judul] ASC",
    status: "Aktif",
    kk: "",
  });

  const [currentFilterSaya, setCurrentFilterSaya] = useState({
    page: 1,
    query: "",
    sort: "[Judul] ASC",
    status: "Aktif",
    uploader: activeUser,
    kk: "",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterKK = useRef();

  const dataFilterSort = [
    { Value: "[Judul] ASC", Text: "Judul Pustaka [↑]" },
    { Value: "[Judul] DESC", Text: "Judul Pustaka [↓]" },
  ];

  const getDataKK = async () => {
    try {
      let data = await UseFetch(API_LINK + "KK/GetFilterKK", { tes: "" });
      if (!data || data.length === 0) {
        throw new Error("Data kosong atau tidak tersedia.");
      } else {
        const formattedData = data.map((item) => ({
          Value: item["Value"],
          Text: decode(item["Text"]),
        }));
        setListKKE(formattedData);
      }
    } catch (e) {
      setIsError({
        error: true,
        message: e.message,
      });
    }
  };

  useEffect(() => {
    getDataKK();
  }, []);

  function handleSearch() {
    if (!searchQuery.current) {
      return;
    }

    if (!searchFilterSort.current) {
      return;
    }

    setIsLoading(true);
    setIsEmpty(false);

    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value || "",
      status: "Aktif",
      sort: searchFilterSort.current.value || "[Judul] ASC",
      kk: searchFilterKK.current.value || "",
    }));

    setCurrentFilterSaya((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value || "",
      sort: searchFilterSort.current.value || "[Judul] ASC",
      status: "",
      uploader: activeUser,
      kk: searchFilterKK.current.value || "",
    }));
  }

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  function handleSetCurrentPageSaya(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilterSaya((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  function handleSetStatus(id, status) {
    setIsError(false);

    SweetAlert(
      "Konfirmasi",
      "Apakah Anda yakin ingin mengubah status data Pustaka?",
      "warning",
      "Ya"
    ).then((confirmed) => {
      if (confirmed) {
        UseFetch(API_LINK + "Pustaka/SetStatusPustaka", {
          idPustaka: id,
          status: status,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else {
              SweetAlert(
                "Sukses",
                "Status data Pustaka berhasil diubah menjadi " + data[0].Status,
                "success"
              );
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => setIsLoading(false));
      }
    });
  }

  const getListPustaka = async () => {
    setIsError(false);
    try {
      let data = await UseFetch(
        API_LINK + "Pustaka/GetDataPustaka",
        currentFilter
      );
      if (data === "ERROR") {
        setCurrentData([]);
        setIsEmpty(true);
      } else if (data.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        setIsEmpty(false);
        setCurrentData(
          data.map((value) => ({
            ...value,
            config: { footer: value.Status },
            data: {
              id: value.Key,
              judul: decode(value["Kelompok Keahlian"]),
              kk: {
                key: value["ID KK"] || "N/A",
                nama: value["Kelompok Keahlian"],
              },
              pemilik: value.PemilikKK,
              kataKunci: value["Kata Kunci"],
              status: value.Status,
              gambar: value.Gambar,
              Keterangan: value.Keterangan,
              File: value.File,
              Nama: value.Nama,
            },
          }))
        );
      }
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getListPustakaSaya = async () => {
    setIsError(false);
    try {
      let data = await UseFetch(
        API_LINK + "Pustaka/GetDataPustakaSaya",
        currentFilterSaya
      );
      if (data === "ERROR") {
        setCurrentDataMilikSaya([]);
        setIsEmpty(true);
      } else if (data.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        setIsEmpty(false);
        setCurrentDataMilikSaya(
          data.map((value) => ({
            ...value,
            config: { footer: value.Status },
            data: {
              id: value.Key,
              judul: decode(value["Kelompok Keahlian"]),
              kk: {
                key: value["ID KK"] || "N/A",
                nama: value["Kelompok Keahlian"],
              },
              pemilik: value.PemilikKK,
              kataKunci: value["Kata Kunci"],
              status: value.Status,
              gambar: value.Gambar,
              Keterangan: value.Keterangan,
              File: value.File,
              Nama: value.Nama,
            },
          }))
        );
      }
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentData([]);
    getListPustaka();
    getListPustakaSaya();
  }, [currentFilter, currentFilterSaya]);

  useEffect(() => {
    getListKK();
    getListPustaka();
  }, []);

  useEffect(() => {
    if (currentData.length === 0 && !isLoading) {
      setIsEmpty(true);
    } else {
      setIsEmpty(false);
    }
  }, [currentData, isLoading]);

  const getListKK = async () => {
    setIsError(false);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "KK/GetDataKK", {
          page: 1,
          query: "",
          sort: "[Nama Kelompok Keahlian] asc",
          status: "Aktif",
        });
        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian."
          );
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else if (data === "data kosong") {
          setListKK(data);
          break;
        } else {
          const formattedData = data.map((item) => ({
            Value: item["Key"],
            Text: item["Nama Kelompok Keahlian"],
          }));
          setListKK(formattedData);
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

  useEffect(() => {
    getListKK();
    getListPustaka();
  }, []);

  async function handleDelete(id) {
    setIsError(false);
    const confirm = await SweetAlert(
      "Konfirmasi Hapus",
      "Anda yakin ingin menghapus permanen data ini?",
      "warning",
      "Hapus"
    );
    if (confirm) {
      const data = await UseFetch(API_LINK + "Pustaka/DeletePustaka", {
        idKK: id,
      });
      if (!data || data === "ERROR" || data.length === 0) {
        setIsError(true);
      } else {
        SweetAlert("Sukses", "Data Pustaka berhasil dihapus.", "success");
        window.location.reload();
      }
    }
  }

  return (
    <>
      <AnimatedSection>
        <div className="backSearch">
          <h1>Knowledge Database</h1>
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
                forInput="pencarianPustaka"
                placeholder="Cari Knowledge Database"
                style={{
                  border: "none",
                  height: "40px",
                  borderRadius: "20px",
                }}
              />
              <ButtonPro
                iconName="search"
                classType="px-4"
                title="Cari"
                onClick={handleSearch}
                style={{ backgroundColor: "transparent", color: "#08549F" }}
              />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {isLoading ? (
        <Loading />
      ) : (
        <AnimatedSection delay={0.4}>
          <div className="d-flex flex-column">
            <div className="flex-fill">
              <div className="container">
                <div className="navigasi-layout-page">
                  <p className="title-kk">Knowledge Database</p>
                  <div className="left-feature">
                    <div className="status">
                      <table>
                        <tbody>
                          <tr>
                            <td>
                              <i
                                className="fas fa-circle"
                                style={{ color: "green" }}
                              ></i>
                            </td>
                            <td>
                              <p>Milik Saya</p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <i
                                className="fas fa-circle"
                                style={{ color: "#66ACE9" }}
                              ></i>
                            </td>
                            <td>
                              <p>Pustaka Bersama</p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <i
                                className="fas fa-circle"
                                style={{ color: "red" }}
                              ></i>
                            </td>
                            <td>
                              <p>Tidak Aktif</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="tes" style={{ display: "flex" }}>
                      <div className="mt-1">
                        <Filter handleSearch={handleSearch}>
                          <DropDown
                            ref={searchFilterSort}
                            forInput="ddUrut"
                            label="Urut Berdasarkan"
                            type="none"
                            arrData={dataFilterSort}
                            defaultValue="[Judul Pustaka] asc"
                          />
                          <DropDown
                            ref={searchFilterKK}
                            forInput="ddUrut"
                            label="Kelompok Keahlian"
                            type="none"
                            arrData={listKKE}
                            defaultValue="Semua"
                          />
                        </Filter>
                      </div>
                      {activerole !== "ROL57" && (
                        <div className="mt-1">
                          <ButtonPro
                            style={{ marginLeft: "20px" }}
                            iconName="add"
                            classType="primary py-2 rounded-4 fw-semibold"
                            label="Tambah"
                            onClick={() => onChangePage("add")}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {isEmpty ? (
                <div className="container">
                  <div className="" style={{ margin: "10px 0px" }}>
                    <Alert
                      type="warning mt-3"
                      message="Tidak ada data! Silahkan cari pustaka diatas.."
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="container">
                    <div className="d-flex flex-column">
                      <div className="flex-fill">
                        <div style={{ margin: "10px 0px" }}>
                          <CardPustaka
                            pustakas={currentDataMilikSaya}
                            onDetail={onChangePage}
                            onEdit={onChangePage}
                            onDelete={handleDelete}
                            uploader={activeUser}
                            onStatus={handleSetStatus}
                            pustakaSaya="ya"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-4 d-flex justify-content-center">
                      <div className="d-flex flex-column">
                        <Paging
                          pageSize={PAGE_SIZE}
                          pageCurrent={currentFilterSaya.page}
                          totalData={currentDataMilikSaya[0]?.Count || 0}
                          navigation={handleSetCurrentPageSaya}
                        />
                      </div>
                    </div>

                    <div className="d-flex flex-column">
                      <div className="flex-fill">
                        <div style={{ margin: "10px 0px" }}>
                          <CardPustaka
                            pustakas={currentData}
                            onDetail={onChangePage}
                            onEdit={onChangePage}
                            onDelete={handleDelete}
                            uploader={activeUser}
                            onStatus={handleSetStatus}
                            pustakaSaya="bukan"
                          />
                        </div>
                      </div>
                    </div>
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
                  </div>
                </>
              )}
            </div>
          </div>
        </AnimatedSection>
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
