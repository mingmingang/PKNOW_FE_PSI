import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { PAGE_SIZE, API_LINK } from "../../../util/Constants";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import "../../../../style/Beranda.css";
import Button2 from "../../../part/Button copy";
import "../../../../../src/index.css";
import CardKK from "../../../part/CardKelompokKeahlian";
import Alert from "../../../part/Alert";
import Paging from "../../../part/Paging";
import Input from "../../../part/Input";
import "../../../../style/Search.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

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

export default function KelolaAKK({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Kelompok Keahlian] asc",
    status: "Aktif",
    prodi: "",
  });

  const searchQuery = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  const scrollContainerRef = useRef(null);
  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  function handleSearch() {
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value,
    }));
  }

  const getListKK = async () => {
    setIsError(false);
    try {
      let data = await UseFetch(API_LINK + "KK/GetDataKK", currentFilter);
      if (data === "ERROR") {
        throw new Error(
          "Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian."
        );
      } else if (data === "data kosong") {
        setCurrentData(data);
      } else {
        const formattedData = data.map((value) => {
          return {
            ...value,
            config: { footer: value.Status },
            data: {
              id: value.Key,
              title: value["Nama Kelompok Keahlian"],
              prodi: { key: value["Kode Prodi"], nama: value.Prodi },
              pic: { key: value["Kode Karyawan"], nama: value.PIC },
              desc: value.Deskripsi,
              status: value.Status,
              members: value.Members || [],
              memberCount: value.Count || 0,
              gambar: value.Gambar,
            },
          };
        });
        setCurrentData(formattedData);
      }
    } catch (e) {
      setIsError(true);
    }
  };

  useEffect(() => {
    getListKK();
  }, [currentFilter]);

  function handleSetStatus(data, status) {
    setIsError(false);
    let message;
    if (data.status === "Draft" && !data.pic.key)
      message = "Apakah anda yakin ingin mengirimkan data ini ke Prodi?";
    else if (data.status === "Draft")
      message = "Apakah anda yakin ingin mempublikasikan data ini?";
    else if (data.status === "Aktif")
      message =
        "Apakah anda yakin ingin <b>menonaktifkan</b> data ini? <b>Semua anggota keahlian akan dikeluarkan secara otomatis</b> jika data ini dinonaktifkan";
    else if (data.status === "Tidak Aktif")
      message = "Apakah anda yakin ingin mengaktifkan data ini?";
    SweetAlert("Konfirmasi", message, "info", "Ya").then((confirm) => {
      if (confirm) {
        UseFetch(API_LINK + "KK/SetStatusKK", {
          idKK: data.id,
          status: status,
        }).then((data) => {
          if (data === "ERROR" || data.length === 0) setIsError(true);
          else {
            let messageResponse;
            if (data[0].Status === "Menunggu") {
              messageResponse =
                "Sukses! Data sudah dikirimkan ke Prodi. Menunggu Prodi menentukan PIC Kelompok Keahlian..";
            } else if (data[0].Status === "Aktif") {
              messageResponse =
                "Sukses! Data berhasil dipublikasi. PIC Kelompok Keahlian dapat menentukan kerangka Program Belajar..";
            }
            SweetAlert("Sukses", messageResponse, "success");
            handleSetCurrentPage(currentFilter.page);
          }
        });
      }
    });
  }
  const [activeTab, setActiveTab] = useState("");

  const tabList = [
    { label: "Semua", value: "" },
    { label: "Pembuatan Peralatan dan Perkakas Produksi", value: "1" },
    { label: "Teknik Produksi dan Proses Manufaktur", value: "2" },
    { label: "Manajemen Informatika", value: "3" },
    { label: "Mesin Otomotif", value: "4" },
    { label: "Mekatronika", value: "5" },
    { label: "Teknologi Konstruksi Bangunan Gedung", value: "10" },
    { label: "Teknologi Rekayasa Pemeliharaan Alat Berat", value: "11" },
    { label: "Teknologi Rekayasa Logistik", value: "12" },
    { label: "Teknologi Rekayasa Perangkat Lunak", value: "13" },
  ];

  const handleTabChange = (value) => {
    setActiveTab(value);

    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      prodi: value,
      page: 1,
    }));
  };

  return (
    <div className="app-container">
      <main>
        <AnimatedSection>
          <div className="backSearch">
            <h1>Kelola Anggota Kelompok Keahlian</h1>
            <p>
              ASTRAtech memiliki banyak program studi, di dalam program studi
              terdapat kelompok keahlian yang biasa disebut dengan Kelompok
              Keahlian
            </p>
            <div className="input-wrapper">
              <div
                className="cari"
                style={{
                  width: "700px",
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
                    width: "680px",
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
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={scrollLeft}
                style={{
                  border: "none",
                  backgroundColor: "#0A5EA8",
                  borderRadius: "100%",
                  width: "45px",
                  height: "40px",
                  fontSize: "18px",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <div
                ref={scrollContainerRef}
                style={{
                  display: "flex",
                  gap: "15px",
                  marginBottom: "20px",
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                  width: "100%",
                  scrollbarWidth: "none",
                }}
                className="scroll-container mt-3"
              >
                {tabList.map(({ label, value }) => (
                  <div key={value}>
                    <button
                      onClick={() => handleTabChange(value)}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "5px",
                        backgroundColor:
                          activeTab === value ? "#0A5EA8" : "#E9ECEF",
                        color: activeTab === value ? "#fff" : "#333",
                        border: "none",
                        cursor: "pointer",
                        minWidth: value === "" ? "200px" : "400px",
                        maxWidth: value === "" ? "200px" : "600px",
                        height: "40px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {label}
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={scrollRight}
                style={{
                  border: "none",
                  backgroundColor: "#0A5EA8",
                  borderRadius: "100%",
                  width: "45px",
                  height: "40px",
                  fontSize: "18px",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>

          <div className="container">
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

            {currentData.length === 0 ? (
              <div className="">
                <Alert type="warning" message="Tidak ada data!" />
              </div>
            ) : (
              <div className="row mt-0 gx-4">
                {currentData
                  .filter(
                    (value) =>
                      (activeTab === "" ||
                        value.Prodi ===
                          tabList.find((tab) => tab.value === activeTab)
                            ?.label) &&
                      value.config.footer !== "Draft" &&
                      value.config.footer !== "Menunggu" &&
                      value.config.footer !== "Tidak Aktif"
                  )
                  .map((value) => (
                    <div className="col-md-4 mb-4" key={value.data.id}>
                      <CardKK
                        key={value.data.id}
                        title="Data Scientist"
                        colorCircle="#61A2DC"
                        ketButton="Kelola Anggota"
                        config={value.config}
                        data={value.data}
                        onChangePage={onChangePage}
                        onChangeStatus={handleSetStatus}
                        showMenu={false}
                        link="add"
                      />
                    </div>
                  ))}
              </div>
            )}
            <div className="mb-4 d-flex justify-content-center">
              <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={currentData[0]?.Count || 0}
                navigation={handleSetCurrentPage}
              />
            </div>
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
}
