import { useEffect, useRef, useState } from "react";
import SweetAlert from "../../../util/SweetAlert";
import Button from "../../../part/Button copy";
import Input from "../../../part/Input";
import Paging from "../../../part/Paging";
import Filter from "../../../part/Filter";
import DropDown from "../../../part/Dropdown";
import Alert from "../../../part/Alert";
import Loading from "../../../part/Loading";
import CardMateri from "../../../part/CardMateri2";
import UseFetch from "../../../util/UseFetch";
import { API_LINK, PAGE_SIZE } from "../../../util/Constants";
import "@fortawesome/fontawesome-free/css/all.css";
import AppContext_test from "./TestContext";
import Konfirmasi from "../../../part/Konfirmasi";
import "../../../../index.css";
import "../../../../style/KelompokKeahlian.css";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    Kategori: null,
    Judul: null,
    File_pdf: null,
    File_vidio: null,
    Pengenalan: null,
    Keterangan: null,
    "Kata Kunci": null,
    Gambar: null,
    Status: "Aktif",
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Judul] ASC", Text: "Nama Materi [↑]" },
  { Value: "[Judul] DESC", Text: "Nama Materi [↓]" },
];

const dataFilterSortDate = [
  { Value: "ASC", Text: "Tanggal [↑]" },
  { Value: "DESC", Text: "Tanggal [↓]" },
];

export default function MasterProsesIndex({ onChangePage, withID, isOpen }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    status: "Aktif",
    query: "",
    sort: "Judul",
    order: "asc",
    date: "",
  });

  const searchQuery = useRef(null);
  const searchFilterSort = useRef(null);

  const handleConfirmYes = () => {
    setShowConfirmation(false);
    onChangePage("kk");
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };

  function handleSetStatus(id) {
    setIsError(false);

    SweetAlert(
      "Konfirmasi",
      "Apakah Anda yakin ingin mengubah status data Materi?",
      "warning",
      "Ya"
    ).then((confirmed) => {
      if (confirmed) {
        UseFetch(API_LINK + "Materi/setStatusMateri", {
          mat_id: id,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else {
              SweetAlert(
                "Sukses",
                "Status data Materi berhasil diubah menjadi " + data[0].Status,
                "success"
              );
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => setIsLoading(false));
      }
    });
  }

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      query: searchQuery.current.value,
      page: 1,
    }));
  }

  function handleSortChange(event) {
    const { value } = event.target;
    const [sort, order] = value.split(" ");
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      sort,
      order,
      page: 1,
    }));
  }

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--responsiveContainer-margin-left",
      "13vw"
    );
    const sidebarMenuElement = document.querySelector(".sidebarMenu");
    if (sidebarMenuElement) {
      sidebarMenuElement.classList.remove("sidebarMenu-hidden");
    }
  }, []);

  useEffect(() => {
    const fetchData = async (retries = 3, delay = 1000) => {
      setIsError(false);
      setIsLoading(true);
      for (let i = 0; i < retries; i++) {
        try {
          const data = await UseFetch(API_LINK + "Materi/GetDataMateri", {
            ...currentFilter,
          });
          if (data.length != 0) {
            setCurrentData(inisialisasiData);
            const formattedData = data.map((value) => ({
              ...value,
            }));
            const promises = formattedData.map((value) => {
              const filePromises = [];

              return Promise.all(filePromises).then((results) => {
                const updatedValue = results.reduce(
                  (acc, curr) => ({ ...acc, ...curr }),
                  value
                );
                return updatedValue;
              });
            });

            Promise.all(promises)
              .then((updatedData) => {
                setCurrentData(updatedData);
              })
              .catch((error) => {});
          } else {
            setCurrentData([]);
          }
        } catch (error) {
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [AppContext_test.refreshPage, currentFilter]);

  return (
    <div className="">
      <div className="">
        <div className="">
          {isError && (
            <div className="flex-fill">
              <Alert
                type="warning"
                message="Terjadi kesalahan: Gagal mengambil data materi."
              />
            </div>
          )}
          <div className="flex-fill">
            <div className="backSearch ml-0 mr-0">
              <h1>Materi P-KNOW</h1>
              <p>
                Akses seluruh materi dari Aplikasi P-KNOW, nikmati pembelajaran
                dari seluruh program studi yang dapat anda pelajari secara mudah
                dan praktis.
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
                    placeholder="Cari Materi"
                    style={{
                      border: "none",
                      width: "680px",
                      height: "40px",
                      borderRadius: "20px",
                    }}
                  />
                  <Button
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
              <p className="title-kk" style={{ fontSize: "20px" }}>
                Materi P-KNOW
              </p>
              <div className="left-feature">
                <div className="tes" style={{ display: "flex" }}>
                  <div className="mr-2">
                    <Filter>
                      <DropDown
                        ref={searchFilterSort}
                        forInput="ddUrut"
                        label="Urut Berdasarkan"
                        type="none"
                        arrData={dataFilterSort}
                        defaultValue="[Judul] ASC"
                        onChange={handleSortChange}
                      />

                      <DropDown
                        ref={searchFilterSort}
                        forInput="ddUrutTanggal"
                        label="Urut Berdasarkan Tanggal"
                        type="none"
                        arrData={dataFilterSortDate}
                        defaultValue="DESC"
                        onChange={(e) => {
                          const { value } = e.target;
                          setCurrentFilter((prevFilter) => ({
                            ...prevFilter,
                            dateOrder: value,
                            page: 1,
                          }));
                        }}
                      />
                    </Filter>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Loading />
            ) : (
              <div className="">
                {!isLoading && currentData.length === 0 && (
                  <div className="" style={{ margin: "5px 80px" }}>
                    <Alert type="warning" message="Tidak ada data!" />
                  </div>
                )}
                {currentFilter.status === "Semua" && currentData.length > 0 && (
                  <CardMateri
                    materis={currentData}
                    onDetail={onChangePage}
                    onEdit={onChangePage}
                    onReviewJawaban={onChangePage}
                    onStatus={handleSetStatus}
                    isNonEdit={true}
                    onBacaMateri={onChangePage}
                  />
                )}
                {currentFilter.status === "Aktif" && currentData.length > 0 && (
                  <CardMateri
                    materis={currentData}
                    onDetail={onChangePage}
                    onEdit={onChangePage}
                    onReviewJawaban={onChangePage}
                    onStatus={handleSetStatus}
                    isNonEdit={true}
                    onBacaMateri={onChangePage}
                  />
                )}
                {currentFilter.status === "Tidak Aktif" &&
                  currentData.length > 0 && (
                    <CardMateri
                      materis={currentData}
                      onDetail={onChangePage}
                      onEdit={onChangePage}
                      onReviewJawaban={onChangePage}
                      onStatus={handleSetStatus}
                      isNonEdit={true}
                      onBacaMateri={onChangePage}
                    />
                  )}
              </div>
            )}

            <div className="mb-4 d-flex justify-content-center">
              <div className="d-flex">
                <Paging
                  pageSize={PAGE_SIZE}
                  pageCurrent={currentFilter.page}
                  totalData={currentData[0]?.Count || 0}
                  navigation={handleSetCurrentPage}
                />
              </div>
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
    </div>
  );
}
