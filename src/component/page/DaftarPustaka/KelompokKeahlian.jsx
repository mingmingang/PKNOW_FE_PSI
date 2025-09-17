import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import "../../../style/Beranda.css";
import Button2 from "../../part/Button copy";
import "../../../../src/index.css";
import CardKK from "../../part/CardKelompokKeahlian";
import Alert from "../../part/Alert";
import Paging from "../../part/Paging";
import Input from "../../part/Input";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import "../../../style/Search.css";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";

const dataFilterSort = [
  { Value: "[Nama Kelompok Keahlian] asc", Text: "Nama Kelompok Keahlian [↑]" },
  {
    Value: "[Nama Kelompok Keahlian] desc",
    Text: "Nama Kelompok Keahlian  [↓]",
  },
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

export default function KK({ onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [isEmpty, setIsEmpty] = useState(false);
  const [currentDataAktif, setCurrentDataAktif] = useState(inisialisasiData);
  const [currentFilterAktif, setCurrentFilterAktif] = useState({
    page: 1,
    query: "",
    sort: "[Nama Kelompok Keahlian] asc",
    status: "Aktif",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();

  function handleSetCurrentPageAktif(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilterAktif((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilterAktif((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value,
      sort: searchFilterSort.current.value,
      status: "",
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
    getListKKAktif();
  }, [currentFilterAktif]);

  const [activeTab, setActiveTab] = useState("Semua");

  return (
    <div className="app-container">
      <main>
        <div className="backSearch">
          <h1>Kelompok Keahlian</h1>
          <p>
            ASTRAtech memiliki banyak program studi, di dalam program studi
            terdapat kelompok keahlian yang biasa disebut dengan Kelompok
            Keahlian
          </p>
          <div className="input-wrapper">
            <div
              className=""
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
                placeholder="Cari"
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

        <div className="navigasi-layout-page">
          <p className="title-kk">Kelompok Keahlian</p>
          <div className="left-feature">
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
                </Filter>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "20px",
            marginLeft: "80px",
            overflowX: "auto",
            whiteSpace: "nowrap",
            width: "100%",
            maxWidth: "1270px",
          }}
          className="scroll-container"
        >
          {[
            "Semua",
            "Pembuatan Peralatan dan Perkakas Produksi",
            "Teknik Produksi dan Proses Manufaktur",
            "Manajemen Informatika",
            "Mesin Otomotif",
            "Mekatronika",
            "Teknologi Konstruksi Bangunan Gedung",
            "Teknologi Rekayasa Pemeliharaan Alat Berat",
            "Teknologi Rekayasa Logistik",
            "Teknologi Rekayasa Perangkat Lunak",
          ].map((tab) => (
            <div key={tab}>
              <button
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "5px",
                  backgroundColor: activeTab === tab ? "#0A5EA8" : "#E9ECEF",
                  color: activeTab === tab ? "#fff" : "#333",
                  border: "none",
                  cursor: "pointer",
                  minWidth: tab === "Semua" ? "200px" : "400px",
                  maxWidth: activeTab === "Semua" ? "200px" : "600px",
                  height: "40px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {tab}
              </button>
            </div>
          ))}
        </div>

        <div className="container">
          {isEmpty ? (
            <Alert
              type="warning mt-3"
              message="Tidak ada data! Silahkan cari kelompok keahlian diatas.."
            />
          ) : (
            <>
              <div className="row mt-0 gx-4">
                {currentDataAktif.length === 0 && (
                  <div className="" style={{ margin: "5px 20px" }}>
                    <Alert type="warning" message="Tidak ada data!" />
                  </div>
                )}
                {currentDataAktif
                  .filter(
                    (value) =>
                      (activeTab === "Semua" || value.Prodi === activeTab) &&
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
                          showMenu={false}
                          ketButton="Lihat Knowledge"
                          link="dapus"
                        />
                      </div>
                    </>
                  ))}
              </div>
              {currentData.filter(
                (value) =>
                  (activeTab === "Semua" || value.Prodi === activeTab) &&
                  value.config.footer !== "Draft" &&
                  value.config.footer !== "Menunggu" &&
                  value.config.footer !== "Tidak Aktif"
              ).length === 0 && (
                <div className="ml-3">
                  <Alert
                    type="warning"
                    message="Tidak ada data yang cocok dengan pilihan Anda!"
                  />
                </div>
              )}
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
        </div>
      </main>
    </div>
  );
}
