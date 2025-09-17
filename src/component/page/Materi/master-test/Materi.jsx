import { useEffect, useState } from "react";
import { API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import profilePicture from "../../../assets/tes.jpg";
import KMS_Rightbar from "../../backbone/KMS_RightBar";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "Kode Test": null,
    "Nama Test": null,
    "Alamat Test": null,
    Status: null,
    Count: 0,
  },
];

export default function MasterTestIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Kode Test] asc",
    status: "Aktif",
  });

  useEffect(() => {
    setIsError(false);
    UseFetch(API_LINK + "MasterTest/GetDataTest", currentFilter)
      .then((data) => {
        if (data === "ERROR") setIsError(false);
        else if (data.length === 0) setCurrentData(inisialisasiData);
        else {
          const formattedData = data.map((value) => {
            return {
              ...value,
              Aksi: ["Toggle", "Detail", "Edit"],
              Alignment: [
                "center",
                "center",
                "left",
                "left",
                "center",
                "center",
              ],
            };
          });
          setCurrentData(formattedData);
        }
      })
      .then(() => setIsLoading(false));
  }, [currentFilter]);

  const circleStyle = {
    width: "50px",
    height: "50px",
    backgroundColor: "lightgray",
    marginRight: "20px",
  };

  return (
    <>
      <div className="d-flex flex-column">
        <KMS_Rightbar />
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data Test."
            />
          </div>
        )}
        <div className="flex-fill"></div>
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <>
              <div style={{ marginRight: "48vh" }}>
                <div className="d-flex align-items-center mb-5">
                  <div
                    className="rounded-circle overflow-hidden d-flex justify-content-center align-items-center"
                    style={circleStyle}
                  >
                    <img
                      src={profilePicture}
                      alt="Profile Picture"
                      className="align-self-start"
                      style={{
                        width: "450%",
                        height: "auto",
                        position: "relative",
                        right: "30px",
                        bottom: "40px",
                      }}
                    />
                  </div>
                  <h6 className="mb-0">Fahriel Dwifaldi - 03 Agustus 2022</h6>
                </div>
                <div className="text-center" style={{ marginBottom: "100px" }}>
                  <h2 className="font-weight-bold mb-4 primary">
                    Pre Test - Pemrograman 1
                  </h2>
                  <p
                    className="mb-5"
                    style={{
                      maxWidth: "600px",
                      margin: "0 auto",
                      marginBottom: "60px",
                    }}
                  >
                    This test consists of 10 questions, the minimum passing
                    score to get a certificate is 80%, and you only have 30
                    minutes to do all the questions, starting when you click the
                    “Start Pre Test” button below.
                  </p>
                  <Button
                    classType="primary ms-2 px-4 py-2"
                    label="Start Pre-Test"
                    onClick={() => onChangePage("soal_pretest")}
                  />
                  <div></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
