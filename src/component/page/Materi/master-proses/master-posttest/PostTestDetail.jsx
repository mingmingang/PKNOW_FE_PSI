import { useState, useEffect } from "react";
import Button from "../../../part/Button";
import Loading from "../../../part/Loading";
import { Stepper } from "react-form-stepper";
import UseFetch from "../../../../util/UseFetch";
import { API_LINK } from "../../../util/Constants";
import AppContext_test from "../../master-test/TestContext";
import Alert from "../../../part/Alert";

export default function MasterPostTestDetail({ onChangePage, withID }) {
  const [formContent, setFormContent] = useState([]);
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState("");

  const [formData, setFormData] = useState({
    quizId: "",
    materiId: "",
    quizJudul: "",
    quizDeskripsi: "",
    gambar: "",
    quizTipe: "Posttest",
    tanggalAwal: "",
    tanggalAkhir: "",
    timer: "",
    status: "Aktif",
    createdby: "Admin",
  });

  useEffect(() => {
    formData.timer = timer;
  }, [timer]);

  const convertSecondsToTimeFormat = (seconds) => {
    const hours = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDateIndonesian = (dateString) => {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const getDataQuiz = async () => {
    setIsLoading(true);

    try {
      while (true) {
        const data = await UseFetch (API_LINK + "Quiz/GetQuizByID", {
          id: AppContext_test.DetailMateri?.Key,
          tipe: "Posttest",
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data quiz.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          const convertedData = {
            ...data.data[0],
            tanggalAwal: data.data[0]?.tanggalAwal
              ? new Date(data.data[0].tanggalAwal).toISOString().split("T")[0]
              : "",
            tanggalAkhir: data.data[0]?.tanggalAkhir
              ? new Date(data.data[0].tanggalAkhir).toISOString().split("T")[0]
              : "",
          };
          setTimer(
            data.data[0].timer
              ? convertSecondsToTimeFormat(data.data[0].timer)
              : ""
          );
          setFormData(convertedData);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  const stripHtmlTags = (str) => {
    return str.replace(/<\/?[^>]+(>|$)/g, "");
  };

  const getDataQuestion = async () => {
    setIsLoading(true);

    try {
      while (true) {
        const { data } = await UseFetch (API_LINK + "Quiz/GetDataQuestion", {
          id: AppContext_test.DetailMateri?.Key,
          status: "Aktif",
          Tipe: "Posttest",
        });
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data quiz.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          const formattedQuestions = {};
          const filePromises = [];

          data.forEach((question) => {
            if (question.Key in formattedQuestions) {
              formattedQuestions[question.Key].options.push({
                id: question.JawabanId,
                label: question.Jawaban,
                point: question.NilaiJawaban || 0,
                key: question.Key,
              });
            } else {
              formattedQuestions[question.Key] = {
                type: question.TipeSoal,
                text: question.Soal,
                options: [],
                gambar: question.Gambar ? question.Gambar : "",
                point: question.NilaiJawaban || 0,
                key: question.Key,
              };

              if (question.TipeSoal === "Pilgan") {
                formattedQuestions[question.Key].options.push({
                  id: question.JawabanId,
                  label: question.Jawaban,
                  point: question.NilaiJawaban || 0,
                  key: question.Key,
                });
              }

              if (question.Gambar) {
                const gambarPromise = fetch(
                  API_LINK +
                    `Upload/DownloadFile?namaFile=${encodeURIComponent(
                      question.Gambar
                    )}`
                )
                  .then((response) => response.blob())
                  .then((blob) => {
                    const url = URL.createObjectURL(blob);
                    formattedQuestions[question.Key].gbr = question.Gambar;
                    formattedQuestions[question.Key].gambar = url;
                  })
                  .catch((error) => {});
                filePromises.push(gambarPromise);
              }
            }
          });

          await Promise.all(filePromises);

          const formattedQuestionsArray = Object.values(formattedQuestions);
          setFormContent(formattedQuestionsArray);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  useEffect(() => {
    getDataQuiz();
  }, [AppContext_test.DetailMateri?.Key]);

  useEffect(() => {
    if (formData.quizId) getDataQuestion();
  }, [formData.quizId]);

  if (isLoading) return <Loading />;

  return (
    <>
      <form id="myForm">
        <div>
          <Stepper
            steps={[
              { label: "Materi", onClick: () => onChangePage("materiDetail") },
              {
                label: "Pretest",
                onClick: () => onChangePage("pretestDetail"),
              },
              {
                label: "Sharing Expert",
                onClick: () => onChangePage("sharingDetail"),
              },
              { label: "Forum", onClick: () => onChangePage("forumDetail") },
              {
                label: "Post Test",
                onClick: () => onChangePage("posttestDetail"),
              },
            ]}
            activeStep={4}
            styleConfig={{
              activeBgColor: "#67ACE9",
              activeTextColor: "#FFFFFF",
              completedBgColor: "#67ACE9",
              completedTextColor: "#FFFFFF",
              inactiveBgColor: "#E0E0E0",
              inactiveTextColor: "#000000",
              size: "2em",
              circleFontSize: "1rem",
              labelFontSize: "0.875rem",
              borderRadius: "50%",
              fontWeight: 500,
            }}
            connectorStyleConfig={{
              completedColor: "#67ACE9",
              activeColor: "#67ACE9",
              disabledColor: "#BDBDBD",
              size: 1,
              stepSize: "2em",
              style: "solid",
            }}
          />
        </div>

        <div className="card mt-4" style={{ borderColor: "#67ACE9" }}>
          <div
            className="card-header fw-medium text-white"
            style={{ backgroundColor: "#67ACE9" }}
          >
            <h4 className="card-title">Data Posttest</h4>
          </div>
          <div className="card-body">
            {formData.quizId ? (
              <>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <h5 className="mb-3 mt-0">Judul Quiz</h5>
                    <p>{formData.quizJudul}</p>
                    <h5 className="mb-3 mt-0">Deskripsi Quiz</h5>
                    <p>{formData.quizDeskripsi}</p>
                    <h5 className="mb-3 mt-0">Durasi</h5>
                    <p>{formData.timer}</p>
                  </div>
                  <div className="col-md-6">
                    <h5 className="mb-3 mt-0">Tanggal Mulai</h5>
                    <p className="pb-3">
                      {formatDateIndonesian(formData.tanggalAwal)}
                    </p>
                    <h5 className="mb-3 mt-0">Tanggal Berakhir</h5>
                    <p className="pb-3">
                      {formatDateIndonesian(formData.tanggalAkhir)}
                    </p>
                  </div>
                </div>
                <div className="card mt-4" style={{ borderColor: "#67ACE9" }}>
                  <div
                    className="card-header fw-medium text-white"
                    style={{ backgroundColor: "#67ACE9" }}
                  >
                    <h4 className="card-title">Pertanyaan</h4>
                  </div>
                  <div className="card-body">
                    <div className="row mt-3">
                      <div className="col-md-12">
                        {formContent.map((question, index) => (
                          <div key={index} className="mb-4">
                            <span className="badge bg-primary mb-2">
                              {question.type === "Essay"
                                ? "Essai"
                                : question.type === "Praktikum"
                                ? "Praktikum"
                                : "Pilihan Ganda"}
                            </span>
                            {question.type === "Essay" ||
                            question.type === "Praktikum"
                              ? question.point !== 0 && (
                                  <span className="badge bg-success ms-2">
                                    {question.point} Poin
                                  </span>
                                )
                              : null}
                            <p>
                              {index + 1}. {stripHtmlTags(question.text)}
                            </p>
                            {question.type === "Pilgan" && (
                              <ul className="list-unstyled">
                                {question.options.map((option, optionIndex) => (
                                  <li
                                    key={optionIndex}
                                    style={{ marginBottom: "5px" }}
                                  >
                                    <input type="radio" disabled />
                                    <span style={{ marginLeft: "5px" }}>
                                      {option.label}
                                    </span>
                                    {option.point !== 0 && (
                                      <span
                                        className="badge bg-success ms-2"
                                        style={{ fontSize: "0.75em" }}
                                      >
                                        {option.point} Poin
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {(question.type === "Essay" ||
                              question.type === "Praktikum") &&
                              question.gambar && (
                                <div>
                                  <img
                                    id="image"
                                    src={question.gambar}
                                    alt="gambar"
                                    className="img-fluid"
                                    style={{
                                      maxWidth: "300px",
                                      maxHeight: "300px",
                                      overflow: "hidden",
                                      marginLeft: "10px",
                                    }}
                                  />
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-body">
                <Alert
                  type="warning"
                  message={
                    <span>
                      Data Posttest belum ditambahkan.{" "}
                      <a
                        onClick={() => onChangePage("posttestEditNot")}
                        className="text-primary"
                      >
                        Tambah Data
                      </a>
                    </span>
                  }
                />
              </div>
            )}
          </div>
        </div>
        <div className="float my-4 mx-1">
          <Button
            classType="outline-secondary me-2 px-4 py-2"
            label="Kembali"
            onClick={() => onChangePage("forumDetail")}
          />
        </div>
      </form>
    </>
  );
}
