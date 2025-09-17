import { useState } from "react";
import Icon from "./Icon.jsx";
import AppContext_master from "../page/Materi/master-proses/MasterContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBook } from "@fortawesome/free-solid-svg-icons";
import AppContext_test from "../page/Materi/master-test/TestContext.jsx";
import { API_LINK } from "../util/Constants.js";
import "../../style/KelompokKeahlian.css";
import review from "../../assets/reviewJawaban.png";
import { decode } from "html-entities";
import Cookies from "js-cookie";
import { decryptId } from "../util/Encryptor.js";

function CardMateri({
  materis,
  onStatus,
  onDelete,
  onEdit,
  onReviewJawaban,
  onBacaMateri,
  onDetail,
  MAX_DESCRIPTION_LENGTH = 100,
  isNonEdit,
}) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).role;
  const [expandDeskripsi, setExpandDeskripsi] = useState({});

  const handleExpandDescription = (bookId) => {
    setExpandDeskripsi((prevState) => ({
      ...prevState,
      [bookId]: !prevState[bookId],
    }));
  };

  const handleStatusChange = (book) => {
    onStatus(book.Key);
  };

  const handleBacaMateri = (book) => {
    AppContext_test.materiId = book.Key;
    AppContext_master.materiId = book.Key;
    AppContext_test.refreshPage += 1;
    onBacaMateri("pengenalan", true, book.Key, true);
  };

  const handleReviewJawaban = (book) => {
    AppContext_test.materiId = book.Key;
    AppContext_master.materiId = book.Key;
    AppContext_master.MateriForm = book;
    onReviewJawaban(
      "reviewjawaban",
      true,
      book.Key,
      true,
      AppContext_master.MateriForm
    );
  };

  return (
    <div className="container">
      <div className="row mt-0 gx-4 ml-0 ">
        {materis.map((book, index) => {
          if (book.Key == null) {
            return null;
          }
          return (
            <div className="col-md-4 mb-4" key={book.Key}>
              <div
                className="bg-white-kk"
                style={{
                  borderColor: book.Status === "Aktif" ? "blue" : "grey",
                }}
              >
                <div className="">
                  <img
                    className="cover-daftar-kk"
                    src={`${API_LINK}Upload/GetFile/${book.Gambar}`}
                    alt="gambar"
                  />
                  <div>
                    <h3
                      className="text-xl font-bold text-blue-600 mt-3"
                      style={{
                        fontSize: "20px",
                        textAlign: "justify",
                        cursor: "pointer",
                        marginLeft: "20px",
                      }}
                      onClick={() => handleBacaMateri(book)}
                    >
                      {book?.Judul
                        ? decode(book.Judul)
                        : "Judul tidak tersedia"}
                    </h3>
                    <div className="mb-1 mt-3" style={{ fontSize: "16px" }}>
                      <FontAwesomeIcon
                        icon={faBook}
                        style={{
                          marginRight: "10px",
                          marginLeft: "20px",
                          fontWeight: "600",
                          color: "black",
                        }}
                      />
                      <span
                        style={{
                          color: "black",
                          fontSize: "16px",
                          fontWeight: "600",
                        }}
                      >
                        {book?.Kategori
                          ? decode(book.Kategori)
                          : "Kategori tidak tersedia"}
                      </span>
                    </div>
                    <div
                      className="mb-1 mt-3"
                      style={{
                        color: "black",
                        fontSize: "16px",
                        fontWeight: "600",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faUser}
                        style={{
                          marginRight: "10px",
                          marginLeft: "20px",
                          fontWeight: "600",
                          color: "black",
                        }}
                      />
                      {book?.Uploader
                        ? decode(book.Uploader)
                        : "Nama tidak tersedia"}{" "}
                      •{" "}
                      {book.Creadate
                        ? new Intl.DateTimeFormat("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }).format(new Date(book.Creadate))
                        : "Tanggal Tidak Tersedia"}
                    </div>
                    <p
                      className="card-text p-0 mt-3 mb-1 mr-3"
                      style={{
                        fontSize: "15px",

                        overflow: "hidden",
                        textAlign: "justify",
                        marginLeft: "16px",
                        color: "grey",
                      }}
                    >
                      {book.Keterangan.length > MAX_DESCRIPTION_LENGTH ? (
                        !expandDeskripsi[book.Key] ? (
                          <>
                            {decode(
                              book.Keterangan.slice(0, MAX_DESCRIPTION_LENGTH)
                            ) + " ..."}
                            <a
                              className="btn btn-link text-decoration-none p-0"
                              onClick={() => handleExpandDescription(book.Key)}
                              style={{ fontSize: "12px" }}
                            >
                              Baca Selengkapnya <Icon name={"caret-down"} />
                            </a>
                          </>
                        ) : (
                          <>
                            {decode(book.Keterangan)}
                            <a
                              className="btn btn-link text-decoration-none p-0"
                              onClick={() => handleExpandDescription(book.Key)}
                              style={{ fontSize: "12px" }}
                            >
                              Tutup <Icon name={"caret-up"} />
                            </a>
                          </>
                        )
                      ) : (
                        <>
                          {book.Keterangan
                            ? decode(book.Keterangan)
                            : "Tidak ada keterangan"}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div
                  className="card-footer d-flex justify-content-end bg-white mr-4 mb-4"
                  style={{
                    borderRadius: "14px",
                    fontSize: "18px",
                    marginBottom: "15px",
                    height: "70px",
                  }}
                >
                  {isNonEdit === false ? (
                    <>
                      {activeUser !== "ROL57" && (
                        <>
                          {book.Status === "Aktif" && (
                            <button
                              className="btn btn-sm text-primary"
                              title="Edit Materi"
                              onClick={() =>
                                onEdit(
                                  "pengenalanEdit",
                                  (AppContext_test.DetailMateriEdit = book),
                                  (AppContext_test.DetailMateri = book),
                                  (AppContext_master.DetailMateri = book)
                                )
                              }
                            >
                              <i
                                className="fas fa-edit"
                                style={{ fontSize: "20px" }}
                              ></i>
                            </button>
                          )}
                          <button
                            className="btn btn-circle"
                            onClick={() => handleStatusChange(book)}
                          >
                            {book.Status === "Aktif" ? (
                              <i
                                className="fas fa-toggle-on text-primary"
                                style={{ fontSize: "20px" }}
                              ></i>
                            ) : (
                              <i
                                className="fas fa-toggle-off text-red"
                                style={{ fontSize: "20px" }}
                              ></i>
                            )}
                          </button>
                          <button
                            className="btn btn-sm text-primary"
                            title="Review Jawaban"
                            onClick={() => handleReviewJawaban(book)}
                          >
                            <img src={review} alt="" width="25px" />
                          </button>
                        </>
                      )}

                      {activeUser === "ROL57" && (
                        <>
                          <div className="">
                            <button
                              className="btn btn-outline-primary mt-2 ml-2"
                              type="button"
                              onClick={() => handleBacaMateri(book)}
                            >
                              Baca Materi
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="">
                      <button
                        className="btn btn-outline-primary mt-2 ml-2"
                        type="button"
                        onClick={() => handleBacaMateri(book)}
                      >
                        Baca Materi
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CardMateri;
