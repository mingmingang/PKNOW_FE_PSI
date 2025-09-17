import { useEffect, useState } from "react";
import { API_LINK } from "../../../util/Constants";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import CardKK from "../../../part/CardKelompokKeahlian";
import Search from "../../../part/Search";
import "../../../../index.css";
import Alert from "../../../part/Alert";
import AnimatedSection from "../../../part/AnimatedSection";

export default function PICIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [currentData, setCurrentData] = useState([]);

  const getListKK = async () => {
    setIsError(false);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "KK/GetDataKKbyProdi");

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian."
          );
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          const formattedData = data.map((value) => {
            let configValue;
            if (value.Status != "Menunggu") configValue = { footer: "Aktif" };
            else
              configValue = {
                footer: "Btn",
                icon: "user",
                className: "primary btn-sm",
                label: "Tambah PIC",
                page: "edit",
              };

            return {
              ...value,
              config: configValue,
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
  }, []);

  function handleSetStatus(data, status) {
    SweetAlert("Error", "Maaf, anda tidak memiliki akses!", "warning");
  }

  return (
    <>
      <AnimatedSection>
        <div className="">
          <Search
            title="Menentukan PIC Kelompok Keahlian"
            description="PIC Kelompok Keahlian dapat memodifikasi kelompok keahlian yang telah dibuat sebelumnya. Segala aktifitas kegiatan yang dilakukan akan diperiksa oleh PIC Kelompok Keahlian."
            placeholder="Cari Kelompok Keahlian"
            showInput={false}
          />
        </div>
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
                          style={{ color: "#b0b0b0" }}
                        ></i>
                      </td>
                      <td>
                        <p>Menunggu PIC dari Prodi</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column">
          <div className="flex-fill">
            <div className="container">
              <div className="row mt-0 gx-4">
                <div className="d-flex justify-content-between">
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
                    ↓ Menunggu PIC dari Prodi
                  </div>
                </div>
                {currentData.filter((value) => {
                  return value.data.status === "Menunggu";
                }).length === 0 && (
                  <div className="" style={{ margin: "5px 0px" }}>
                    <Alert type="warning" message="Tidak ada data!" />
                  </div>
                )}
                {currentData
                  .filter((value) => {
                    return value.data.status === "Menunggu";
                  })
                  .map((value) => (
                    <div className="col-md-4 mb-4" key={value.data.id}>
                      <CardKK
                        key={value.data.id}
                        config={value.config}
                        data={value.data}
                        onChangePage={onChangePage}
                      />
                    </div>
                  ))}

                <div className="my-3">
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
                </div>
                {currentData.filter((value) => {
                  return value.data.status !== "Menunggu";
                }).length === 0 && (
                  <div className="" style={{ margin: "5px 0px" }}>
                    <Alert type="warning" message="Tidak ada data!" />
                  </div>
                )}
                {currentData
                  .filter((value) => {
                    return value.data.status != "Menunggu";
                  })
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
            </div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
