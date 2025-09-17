import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { PAGE_SIZE, API_LINK } from "../../../util/Constants";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import "../../../../style/Beranda.css";
import Button2 from "../../../part/Button copy";
import "../../../../../src/index.css";
import ButtonPro from "../../../part/Button copy";
import CardKK from "../../../part/CardKelompokKeahlian";
import Alert from "../../../part/Alert";
import Paging from "../../../part/Paging";
import Input from "../../../part/Input";
import Filter from "../../../part/Filter";
import DropDown from "../../../part/Dropdown";
import "../../../../style/Search.css";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";

const AnimatedSection = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: "easeOut",
      },
    },
    hidden: {
      opacity: 0,
      y: 50,
    },
  };
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

const dataFilterSort = [
  { Value: "[Nama Kelompok Keahlian] asc", Text: "Nama Kelompok Keahlian [↑]" },
  {
    Value: "[Nama Kelompok Keahlian] desc",
    Text: "Nama Kelompok Keahlian  [↓]",
  },
];

const dataFilterStatus = [
  { Value: "", Text: "Semua" },
  { Value: "Menunggu", Text: "Menunggu PIC Prodi" },
  { Value: "Draft", Text: "Draft" },
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "Nama Kelompok Keahlian": null,
    PIC: null,
    Deskripsi: null,
    Status: null,
    "Kode Prodi": null,
    Prodi: null,
    Gambar: null,
    Count: 0,
    config: { footer: null },
    data: {
      id: null,
      title: null,
      prodi: "",
      pic: "",
      desc: "0",
      status: null,
      members: null,
      memberCount: 0,
      gambar: 0,
    },
  },
];

export default function KelolaKK({ onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [currentDataAktif, setCurrentDataAktif] = useState(inisialisasiData);
  const [currentFilterAktif, setCurrentFilterAktif] = useState({
    page: 1,
    query: "",
    sort: "[Nama Kelompok Keahlian] asc",
    status: "Aktif",
    prodi: "",
  });
  const [currentDataMenunggu, setCurrentDataMenunggu] =
    useState(inisialisasiData);
  const [currentFilterMenunggu, setCurrentFilterMenunggu] = useState({
    page: 1,
    query: "",
    sort: "[Nama Kelompok Keahlian] asc",
    status: "Menunggu",
    prodi: "",
  });
  const [currentDataNonAktif, setCurrentDataNonAktif] =
    useState(inisialisasiData);
  const [currentFilterNonAktif, setCurrentFilterNonAktif] = useState({
    page: 1,
    query: "",
    sort: "[Nama Kelompok Keahlian] asc",
    status: "Tidak Aktif",
    prodi: "",
  });
  const [currentDataDraft, setCurrentDataDraft] = useState(inisialisasiData);
  const [currentFilterDraft, setCurrentFilterDraft] = useState({
    page: 1,
    query: "",
    sort: "[Nama Kelompok Keahlian] asc",
    status: "Draft",
    prodi: "",
  });
  const [activeFilterStatus, setActiveFilterStatus] = useState("");

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  function handleSetCurrentPageAktif(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilterAktif((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  function handleSetCurrentPageMenunggu(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilterMenunggu((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  function handleSetCurrentPageNonAktif(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilterNonAktif((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  function handleSetCurrentPageDraft(newCurrentPage) {
    setCurrentFilterDraft((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  function handleSearch() {
    setIsLoading(true);
    const newQuery = searchQuery.current.value;
    const newSort = searchFilterSort.current.value;
    const newStatus = searchFilterStatus.current.value;

    setActiveFilterStatus(newStatus);

    setCurrentFilterDraft((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: newQuery,
      sort: newSort,
      status: newStatus === "" ? "Draft" : newStatus,
      prodi: "",
    }));

    setCurrentFilterAktif((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: newQuery,
      sort: newSort,
      status: newStatus === "" ? "Aktif" : newStatus,
      prodi: "",
    }));

    setCurrentFilterNonAktif((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: newQuery,
      sort: newSort,
      status: newStatus === "" ? "Tidak Aktif" : newStatus,
      prodi: "",
    }));

    setCurrentFilterMenunggu((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: newQuery,
      sort: newSort,
      status: newStatus === "" ? "Menunggu" : newStatus,
      prodi: "",
    }));
  }

  const getListKKAktif = async () => {
    setIsEmpty(true);
    setIsError(false);
    try {
      let data = await UseFetch(API_LINK + "KK/GetDataKK", currentFilterAktif);
      if (data === "ERROR") {
        throw new Error(
          "Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian."
        );
      } else if (data.length === 0) {
        setCurrentDataAktif(data);
      } else {
        setIsEmpty(false);
        const formattedData = data.map((value) => {
          return {
            ...value,
            config: { footer: value.Status },
            data: {
              id: value.Key,
              title: value["Nama Kelompok Keahlian"],
              prodi: { key: value["Kode Prodi"] || "N/A", nama: value.Prodi },
              pic: { key: value["Kode Karyawan"], nama: value.PIC },
              desc: value.Deskripsi,
              status: value.Status,
              members: value.Members || [],
              memberCount: value.Count || 0,
              gambar: value.Gambar,
            },
          };
        });
        setCurrentDataAktif(formattedData);
      }
    } catch (e) {
      setIsError(true);
    }
  };

  const getListKKNonAktif = async () => {
    setIsEmpty(true);
    setIsError(false);
    try {
      let data = await UseFetch(
        API_LINK + "KK/GetDataKK",
        currentFilterNonAktif
      );
      if (data === "ERROR") {
        throw new Error(
          "Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian."
        );
      } else if (data.length === 0) {
        setCurrentDataNonAktif(data);
      } else {
        setIsEmpty(false);
        const formattedData = data.map((value) => {
          return {
            ...value,
            config: { footer: value.Status },
            data: {
              id: value.Key,
              title: value["Nama Kelompok Keahlian"],
              prodi: { key: value["Kode Prodi"] || "N/A", nama: value.Prodi },
              pic: { key: value["Kode Karyawan"], nama: value.PIC },
              desc: value.Deskripsi,
              status: value.Status,
              members: value.Members || [],
              memberCount: value.Count || 0,
              gambar: value.Gambar,
            },
          };
        });
        setCurrentDataNonAktif(formattedData);
      }
    } catch (e) {
      setIsError(true);
    }
  };

  const getListKKMenunggu = async () => {
    setIsEmpty(true);
    setIsError(false);
    try {
      let data = await UseFetch(
        API_LINK + "KK/GetDataKK",
        currentFilterMenunggu
      );
      if (data === "ERROR") {
        throw new Error(
          "Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian."
        );
      } else if (data.length === 0) {
        setCurrentDataMenunggu(data);
      } else {
        setIsEmpty(false);
        const formattedData = data.map((value) => {
          return {
            ...value,
            config: { footer: value.Status },
            data: {
              id: value.Key,
              title: value["Nama Kelompok Keahlian"],
              prodi: { key: value["Kode Prodi"] || "N/A", nama: value.Prodi },
              pic: { key: value["Kode Karyawan"], nama: value.PIC },
              desc: value.Deskripsi,
              status: value.Status,
              members: value.Members || [],
              memberCount: value.Count || 0,
              gambar: value.Gambar,
            },
          };
        });
        setCurrentDataMenunggu(formattedData);
      }
    } catch (e) {
      setIsError(true);
    }
  };

  const getListKKDraft = async () => {
    setIsEmpty(true);
    setIsError(false);
    try {
      let data = await UseFetch(API_LINK + "KK/GetDataKK", currentFilterDraft);
      if (data === "ERROR") {
        throw new Error(
          "Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian."
        );
      } else if (data.length === 0) {
        setCurrentDataDraft(data);
      } else {
        setIsEmpty(false);
        const formattedData = data.map((value) => {
          return {
            ...value,
            config: { footer: value.Status },
            data: {
              id: value.Key,
              title: value["Nama Kelompok Keahlian"],
              prodi: { key: value["Kode Prodi"] || "N/A", nama: value.Prodi },
              pic: { key: value["Kode Karyawan"], nama: value.PIC },
              desc: value.Deskripsi,
              status: value.Status,
              members: value.Members || [],
              memberCount: value.Count || 0,
              gambar: value.Gambar,
            },
          };
        });
        setCurrentDataDraft(formattedData);
      }
    } catch (e) {
      setIsError(true);
    }
  };

  function handleSetStatus(data, status) {
    let keyProdi = data.prodi.key;
    setIsError(false);
    let message;
    if (data.status === "Draft" && !data.pic.key)
      message = "Apakah anda yakin ingin mengirimkan data ini ke Prodi?";
    else if (data.status === "Draft")
      message = "Apakah anda yakin ingin mempublikasikan data ini?";
    else if (data.status === "Aktif")
      message =
        "Apakah anda yakin ingin menonaktifkan data ini? Semua anggota keahlian akan dikeluarkan secara otomatis jika data ini dinonaktifkan";
    else if (data.status === "Tidak Aktif")
      message = "Apakah anda yakin ingin mengaktifkan data ini?";

    SweetAlert("Konfirmasi", message, "info", "Ya").then((confirm) => {
      if (confirm) {
        UseFetch(API_LINK + "KK/SetStatusKK", {
          idKK: data.id,
          status: status,
          pic: data.pic.key,
        }).then((data) => {
          if (data === "ERROR" || data.length === 0) setIsError(true);
          else {
            let messageResponse;
            if (status === "Menunggu") {
              UseFetch(API_LINK + "Utilities/createNotifikasi", {
                p1: "SENTTOPRODI",
                p2: "ID12346",
                p3: "APP64",
                p4: "PIC P-KNOW",
                p5: activeUser,
                p6: "Kepada Program Studi dimohon untuk memilih salah satu Tenaga Pendidik untuk menjadi PIC Kelompok Keahlian",
                p7: "Pemilihan PIC Kelompok Keahlian",
                p8: "Dimohon kepada pihak program studi untuk memilih salah satu PIC KK yang dapat mengampu kelompok keahlian",
                p9: "Dari PIC P-KNOW",
                p10: "0",
                p11: "Jenis Lain",
                p12: activeUser,
                p13: "ROL22",
                p14: keyProdi,
              }).then((data) => {
                if (data === "ERROR" || data.length === 0) setIsError(true);
                else {
                  messageResponse =
                    "Sukses! Data sudah dikirimkan ke Prodi. Menunggu Prodi menentukan PIC Kelompok Keahlian..";
                }
              });
              messageResponse =
                "Sukses! Data sudah dikirimkan ke Prodi. Menunggu Prodi menentukan PIC Kelompok Keahlian..";
            } else if (status === "Aktif") {
              messageResponse =
                "Sukses! Data berhasil dipublikasi. PIC Kelompok Keahlian dapat menentukan kerangka Program Belajar..";
            } else if (status === "Tidak Aktif") {
              messageResponse =
                "Sukses! Data berhasil dinonaktifkan. PIC Kelompok Keahlian kembali menjadi Tenaga Pendidik saja";
            }
            SweetAlert("Sukses", messageResponse, "success");
            window.location.reload();
          }
        });
      }
    });
  }

  useEffect(() => {
    if (activeFilterStatus === "Aktif") {
      getListKKAktif();
    } else if (activeFilterStatus === "Menunggu") {
      getListKKMenunggu();
    } else if (activeFilterStatus === "Draft") {
      getListKKDraft();
    } else if (activeFilterStatus === "Tidak Aktif") {
      getListKKNonAktif();
    } else {
      getListKKAktif();
      getListKKMenunggu();
      getListKKDraft();
      getListKKNonAktif();
    }
  }, [
    activeFilterStatus,
    currentFilterAktif,
    currentFilterMenunggu,
    currentFilterDraft,
    currentFilterNonAktif,
  ]);

  async function handleDelete(id) {
    setIsError(false);
    const confirm = await SweetAlert(
      "Konfirmasi Hapus",
      "Anda yakin ingin menghapus permanen data ini?",
      "warning",
      "Hapus"
    );
    if (confirm) {
      const data = await UseFetch(API_LINK + "KK/DeleteKK", { idKK: id });
      if (!data || data === "ERROR" || data.length === 0) {
        setIsError(true);
      } else {
        SweetAlert("Sukses", "Data berhasil dihapus.", "success");
        window.location.reload();
      }
    }
  }

  return (
    <div className="app-container">
      <main>
        <AnimatedSection>
          <div className="backSearch">
            <h1>Kelola Kelompok Keahlian</h1>
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
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <div className="container">
            <div className="navigasi-layout-page">
              <p className="title-kk">Kelompok Keahlian</p>
              <div className="left-feature">
                <div className="status">
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <i
                            className="fas fa-circle"
                            style={{ color: "#4a90e2" }}
                          ></i>
                        </td>
                        <td>
                          <p>Aktif/Sudah Publikasi</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <i
                            className="fas fa-circle"
                            style={{ color: "orange" }}
                          ></i>
                        </td>
                        <td>
                          <p>Menunggu PIC dari Prodi</p>
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
                      <tr>
                        <td>
                          <i
                            className="fas fa-circle"
                            style={{ color: "gray" }}
                          ></i>
                        </td>
                        <td>
                          <p>Draft</p>
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
                        defaultValue="[Nama Kelompok Keahlian] asc"
                      />
                      <DropDown
                        ref={searchFilterStatus}
                        forInput="ddStatus"
                        label="Status"
                        type="none"
                        arrData={dataFilterStatus}
                        defaultValue="Semua"
                      />
                    </Filter>
                  </div>
                  <div className="mt-1">
                    <ButtonPro
                      style={{ marginLeft: "20px" }}
                      iconName="add"
                      classType="primary py-2 fw-semibold rounded-4"
                      label="Tambah"
                      onClick={() => onChangePage("add")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container">
            {isEmpty ? (
              <Alert
                type="warning mt-3"
                message="Tidak ada data! Silahkan cari kelompok keahlian diatas.."
              />
            ) : (
              <>
                {activeFilterStatus === "" && (
                  <>
                    <div
                      className="card-keterangan"
                      style={{
                        background: "#A7AAAC",
                        borderRadius: "5px",
                        padding: "10px 20px",
                        marginBottom: "20px",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      ↓ Data Draft / Belum dikirimkan ke Prodi / Belum
                      dipublikasi
                    </div>
                    <div className="row mt-0 gx-4">
                      {currentDataDraft.length === 0 && (
                        <div className="" style={{ margin: "5px 0px" }}>
                          <Alert type="warning" message="Tidak ada data!" />
                        </div>
                      )}
                      {currentDataDraft
                        .filter((value) => value.config.footer === "Draft")
                        .map((value) => (
                          <div className="col-md-4 mb-4" key={value.data.id}>
                            <CardKK
                              key={value.data.id}
                              config={value.config}
                              data={value.data}
                              onChangePage={onChangePage}
                              onDelete={handleDelete}
                              onChangeStatus={handleSetStatus}
                            />
                          </div>
                        ))}
                    </div>
                    <div className="mb-4 d-flex justify-content-center">
                      <div className="d-flex flex-column ">
                        <Paging
                          pageSize={PAGE_SIZE}
                          pageCurrent={currentFilterDraft.page}
                          totalData={currentDataDraft[0]?.Count || 0}
                          navigation={handleSetCurrentPageDraft}
                        />
                      </div>
                    </div>

                    <div
                      className="card-keterangan"
                      style={{
                        background: "orange",
                        borderRadius: "5px",
                        padding: "10px 20px",
                        marginBottom: "20px",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      ↓ Menunggu PIC dari Prodi
                    </div>

                    <div className="row mt-0 gx-4">
                      {currentDataMenunggu.length === 0 && (
                        <div className="" style={{ margin: "5px 0px" }}>
                          <Alert type="warning" message="Tidak ada data!" />
                        </div>
                      )}
                      {currentDataMenunggu
                        .filter((value) => value.config.footer === "Menunggu")
                        .map((value) => (
                          <div className="col-md-4 mb-4" key={value.data.id}>
                            <CardKK
                              key={value.data.id}
                              config={value.config}
                              data={value.data}
                              onChangePage={onChangePage}
                              onChangeStatus={handleSetStatus}
                            />
                          </div>
                        ))}
                    </div>
                    <div className="mb-4 d-flex justify-content-center">
                      <div className="d-flex flex-column ">
                        <Paging
                          pageSize={PAGE_SIZE}
                          pageCurrent={currentFilterMenunggu.page}
                          totalData={currentDataMenunggu[0]?.Count || 0}
                          navigation={handleSetCurrentPageMenunggu}
                        />
                      </div>
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
                      ↓ Data Aktif / Sudah Dipublikasikan
                    </div>
                    <div className="row mt-0 gx-4">
                      {currentDataAktif.length === 0 && (
                        <div className="" style={{ margin: "5px 0px" }}>
                          <Alert type="warning" message="Tidak ada data!" />
                        </div>
                      )}
                      {currentDataAktif
                        .filter(
                          (value) =>
                            value.config.footer !== "Draft" &&
                            value.config.footer !== "Menunggu" &&
                            value.config.footer !== "Tidak Aktif"
                        )

                        .map((value) => (
                          <>
                            <div className="col-md-4 mb-4" key={value.data.id}>
                              <CardKK
                                key={value.data.id}
                                title="Data Scientist"
                                colorCircle="#61A2DC"
                                config={value.config}
                                data={value.data}
                                onChangePage={onChangePage}
                                onChangeStatus={handleSetStatus}
                              />
                            </div>
                          </>
                        ))}
                    </div>
                    <div className="mb-4 d-flex justify-content-center">
                      <div className="d-flex flex-column ">
                        <Paging
                          pageSize={PAGE_SIZE}
                          pageCurrent={currentFilterAktif.page}
                          totalData={currentDataAktif[0]?.Count || 0}
                          navigation={handleSetCurrentPageAktif}
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeFilterStatus === "Draft" && (
                  <>
                    <div
                      className="card-keterangan"
                      style={{
                        background: "#A7AAAC",
                        borderRadius: "5px",
                        padding: "10px 20px",
                        marginBottom: "20px",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      ↓ Data Draft / Belum dikirimkan ke Prodi / Belum
                      dipublikasi
                    </div>
                    <div className="row mt-0 gx-4">
                      {currentDataDraft.length === 0 && (
                        <div className="" style={{ margin: "5px 0px" }}>
                          <Alert type="warning" message="Tidak ada data!" />
                        </div>
                      )}
                      {currentDataDraft
                        .filter((value) => value.config.footer === "Draft")
                        .map((value) => (
                          <div className="col-md-4 mb-4" key={value.data.id}>
                            <CardKK
                              key={value.data.id}
                              config={value.config}
                              data={value.data}
                              onChangePage={onChangePage}
                              onDelete={handleDelete}
                              onChangeStatus={handleSetStatus}
                            />
                          </div>
                        ))}
                    </div>
                    <div className="mb-4 d-flex justify-content-center">
                      <div className="d-flex flex-column ">
                        <Paging
                          pageSize={PAGE_SIZE}
                          pageCurrent={currentFilterDraft.page}
                          totalData={currentDataDraft[0]?.Count || 0}
                          navigation={handleSetCurrentPageDraft}
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeFilterStatus === "Menunggu" && (
                  <>
                    <div
                      className="card-keterangan"
                      style={{
                        background: "orange",
                        borderRadius: "5px",
                        padding: "10px 20px",
                        marginBottom: "20px",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      ↓ Menunggu PIC dari Prodi
                    </div>

                    <div className="row mt-0 gx-4">
                      {currentDataMenunggu.length === 0 && (
                        <div className="" style={{ margin: "5px 0px" }}>
                          <Alert type="warning" message="Tidak ada data!" />
                        </div>
                      )}
                      {currentDataMenunggu
                        .filter((value) => value.config.footer === "Menunggu")
                        .map((value) => (
                          <div className="col-md-4 mb-4" key={value.data.id}>
                            <CardKK
                              key={value.data.id}
                              config={value.config}
                              data={value.data}
                              onChangePage={onChangePage}
                              onChangeStatus={handleSetStatus}
                            />
                          </div>
                        ))}
                    </div>
                    <div className="mb-4 d-flex justify-content-center">
                      <div className="d-flex flex-column ">
                        <Paging
                          pageSize={PAGE_SIZE}
                          pageCurrent={currentFilterMenunggu.page}
                          totalData={currentDataMenunggu[0]?.Count || 0}
                          navigation={handleSetCurrentPageMenunggu}
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeFilterStatus === "Aktif" && (
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
                      ↓ Data Aktif / Sudah Dipublikasikan
                    </div>
                    <div className="row mt-0 gx-4">
                      {currentDataAktif.length === 0 && (
                        <div className="" style={{ margin: "5px 0px" }}>
                          <Alert type="warning" message="Tidak ada data!" />
                        </div>
                      )}
                      {currentDataAktif
                        .filter(
                          (value) =>
                            value.config.footer !== "Draft" &&
                            value.config.footer !== "Menunggu" &&
                            value.config.footer !== "Tidak Aktif"
                        )

                        .map((value) => (
                          <>
                            <div className="col-md-4 mb-4" key={value.data.id}>
                              <CardKK
                                key={value.data.id}
                                title="Data Scientist"
                                colorCircle="#61A2DC"
                                config={value.config}
                                data={value.data}
                                onChangePage={onChangePage}
                                onChangeStatus={handleSetStatus}
                              />
                            </div>
                          </>
                        ))}
                    </div>
                    <div className="mb-4 d-flex justify-content-center">
                      <div className="d-flex flex-column ">
                        <Paging
                          pageSize={PAGE_SIZE}
                          pageCurrent={currentFilterAktif.page}
                          totalData={currentDataAktif[0]?.Count || 0}
                          navigation={handleSetCurrentPageAktif}
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeFilterStatus === "Tidak Aktif" && (
                  <>
                    <div
                      className="card-keterangan"
                      style={{
                        background: "red",
                        borderRadius: "5px",
                        padding: "10px 20px",
                        marginBottom: "20px",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      ↓ Tidak Aktif/Dinonaktifkan
                    </div>
                    <div className="row mt-0 gx-4">
                      {currentDataNonAktif.length === 0 && (
                        <div className="" style={{ margin: "5px 0px" }}>
                          <Alert type="warning" message="Tidak ada data!" />
                        </div>
                      )}
                      {currentDataNonAktif
                        .filter(
                          (value) => value.config.footer === "Tidak Aktif"
                        )
                        .map((value) => (
                          <div className="col-md-4 mb-4" key={value.data.id}>
                            <CardKK
                              key={value.data.id}
                              title="Data Scientist"
                              colorCircle="#61A2DC"
                              config={value.config}
                              data={value.data}
                              onChangePage={onChangePage}
                              onChangeStatus={handleSetStatus}
                            />
                          </div>
                        ))}
                    </div>
                    <div className="mb-4 d-flex justify-content-center">
                      <div className="d-flex flex-column ">
                        <Paging
                          pageSize={PAGE_SIZE}
                          pageCurrent={currentFilterNonAktif.page}
                          totalData={currentDataNonAktif[0]?.Count || 0}
                          navigation={handleSetCurrentPageNonAktif}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
}
