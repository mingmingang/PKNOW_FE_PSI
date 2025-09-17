import { useEffect, useState } from "react";
import UseFetch from "../../../util/UseFetch";
import Alert from "../../../part/Alert";
import Loading from "../../../part/Loading";
import CardKK from "../../../part/CardKelompokKeahlian2";
import { API_LINK } from "../../../util/Constants";
import AppContext_test from "../master-test/TestContext";
import Search from "../../../part/Search";

export default function SubKKIndex({ onChangePage }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [listKK, setListKK] = useState([]);

  const getKKAndPrograms = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        let kryId = await UseFetch(API_LINK + "Utilities/GetUserLogin", {
          p1: AppContext_test.activeUser,
        });
        AppContext_test.karyawanId = kryId[0].kry_id;
        setIsError({ error: false, message: "" });
        setIsLoading(true);

        let kkData = await UseFetch(API_LINK + "Program/GetDataKKByAKK", {
          p1: AppContext_test.activeUser,
        });

        if (!Array.isArray(kkData)) {
          setIsLoading(false);
          return;
        }

        if (kkData.length === 0) {
          setListKK([]);
          setIsLoading(false);
          return;
        }

        if (kkData === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data Kelompok Keahlian."
          );
        }

        const kkWithPrograms = [];

        for (const kk of kkData) {
          const programData = await UseFetch(
            API_LINK + "Program/GetProgramByKK",
            { kk: kk.Key }
          );
          if (programData === "ERROR") {
            throw new Error("Terjadi kesalahan: Gagal mengambil data Program.");
          }

          const anggotaCountData = await UseFetch(
            API_LINK + "Program/CountAnggotaByKK",
            { p1: kk.Key }
          );

          if (anggotaCountData === "ERROR") {
            throw new Error(
              "Terjadi kesalahan: Gagal menghitung jumlah anggota."
            );
          }

          const anggotaCount = anggotaCountData.length;

          const programCountData = await UseFetch(
            API_LINK + "Program/CountProgramByKK",
            { p1: kk.Key }
          );

          if (programCountData === "ERROR") {
            throw new Error(
              "Terjadi kesalahan: Gagal menghitung jumlah anggota."
            );
          }

          const programCount = programCountData.length;

          const programsWithCategories = [];

          for (const program of programData) {
            const categoryData = await UseFetch(
              API_LINK + "Program/GetKategoriByProgram",
              { p1: program.Key, p2: "", p3: "", p4: "Aktif" }
            );

            const categoriesWithMaterialCounts = await Promise.all(
              categoryData.map(async (category) => {
                const materialCountData = await UseFetch(
                  API_LINK + "Program/CountMateriByKategori",
                  { p1: category.Key }
                );
                return { ...category, materialCount: materialCountData.length };
              })
            );

            programsWithCategories.push({
              ...program,
              categories: categoriesWithMaterialCounts,
            });
          }

          kkWithPrograms.push({
            ...kk,
            programs: programsWithCategories,
            AnggotaCount: anggotaCount,
            ProgramCount: programCount,
          });
        }

        setListKK(kkWithPrograms);
        setIsLoading(false);
        return kkWithPrograms;
      } catch (error) {
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          setIsLoading(false);
          throw error;
        }
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await getKKAndPrograms();
      } catch (error) {
        if (isMounted) {
          setIsError({
            error: true,
            message: error.message || "Gagal memuat data. Silakan coba lagi.",
          });
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Search
        title="Kelola Materi"
        description="Program ini terdiri dari berbagai kategori yang dirancang untuk mempermudah pengelompokan materi sesuai dengan topik atau tema tertentu. Setiap kategori memiliki sejumlah materi yang dapat Anda kelola secara fleksibel, mulai dari menambah, mengedit, hingga menghapus materi sesuai kebutuhan."
        showInput={false}
      />
      {isError.error && <Alert type="danger" message={isError.message} />}
      <div className="d-flex flex-column">
        {isLoading ? (
          <div className="my-5">
            <Loading />
          </div>
        ) : listKK.length === 0 ? (
          <div className="mx-5 my-5">
            <Alert
              type="warning"
              message="Anda tidak tergabung pada Program Kelompok Keahlian manapun saat ini."
            />
          </div>
        ) : (
          listKK.map((kk, index) => (
            <CardKK key={index} kk={kk} onChangePage={onChangePage} />
          ))
        )}
      </div>
    </>
  );
}
