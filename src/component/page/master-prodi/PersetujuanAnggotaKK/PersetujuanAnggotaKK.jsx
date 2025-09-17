import Search from "../../../part/Search";
import "../../../../index.css";
import { useEffect, useState } from "react";
import { API_LINK } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import CardKonfirmasi from "../../../part/CardKonfirmasi";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import AnimatedSection from "../../../part/AnimatedSection";

export default function PersetujuanAnggotaKK({ onChangePage }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState([]);

  const getListKK = async () => {
    setIsError({ error: false, message: "" });
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "KK/GetDataKKbyProdi");
        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian."
          );
        } else {
          setCurrentData(data);
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
    getListKK();
  }, []);

  return (
    <>
      <AnimatedSection>
        <div className="app-container">
          <main>
            <Search
              title="Persetujuan Anggota Keahlian"
              description="Program Studi dapat menyetujui persetujuan pengajuan anggota keahlian yang diajukan oleh Tenaga Pendidik untuk menjadi anggota dalam Kelompok Keahlian. Program Studi dapat melihat lampiran pengajuan dari Tenaga Pendidik untuk menjadi bahan pertimbangan"
              placeholder="Cari Kelompok Keahlian"
              showInput={false}
            />
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
                              style={{ color: "#FFC619" }}
                            ></i>
                          </td>
                          <td>
                            <p>Menunggu Persetujuan</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <>
              {isLoading ? (
                <Loading />
              ) : (
                <div className="d-flex flex-column">
                  {isError.error && (
                    <div className="flex-fill">
                      <Alert type="danger" message={isError.message} />
                    </div>
                  )}

                  <div className="container">
                    <div className="row mt-0 gx-4 mb-4">
                      {currentData.filter((value) => {
                        return value.Status === "Aktif";
                      }).length === 0 && (
                        <div className="" style={{ margin: "5px 0px" }}>
                          <Alert type="warning" message="Tidak ada data!" />
                        </div>
                      )}
                      {currentData
                        .filter((value) => {
                          return value.Status === "Aktif";
                        })
                        .map((value) => (
                          <CardKonfirmasi
                            key={value.Key}
                            data={value}
                            onChangePage={onChangePage}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          </main>
        </div>
      </AnimatedSection>
    </>
  );
}
