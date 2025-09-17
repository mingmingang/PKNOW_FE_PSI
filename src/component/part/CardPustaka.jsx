import "../../style/KelompokKeahlian.css";
import { API_LINK } from "../util/Constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBook } from "@fortawesome/free-solid-svg-icons";
import Icon from "../part/Icon";
import Input from "./Input";
import Cookies from "js-cookie";
import { decryptId } from "../util/Encryptor";
import Alert from "./Alert";
import { decode } from "he";

function CardPustaka({
  pustakas,
  uploader,
  onStatus,
  onDelete,
  onEdit = () => {},
  onDetail = () => {},
  pustakaSaya,
}) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const handleDeleteClick = (book) => {
    onDelete(book.Key);
  };

  const handleStatusChange = (book, status) => {
    onStatus(book, status);
  };

  return (
    <>
      {pustakaSaya === "ya" ? (
        <>
          <div
            className="card-keterangan"
            style={{
              background: "#198754",
              borderRadius: "5px",
              padding: "10px 20px",
              marginBottom: "20px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            ↓ Milik Saya
          </div>

          <div className="row mt-0 gx-4">
            {pustakas.filter(
              (book) =>
                book.Key !== null &&
                (book.PemilikKK === activeUser || uploader === book.Uploader)
            ).length === 0 ? (
              <div className="col-md-12">
                <Alert type="warning" message="Tidak ada data.." />
              </div>
            ) : (
              pustakas.map((book) => {
                if (
                  book.Key &&
                  (book.PemilikKK === activeUser || uploader === book.Uploader)
                ) {
                  return (
                    <>
                      <div className="col-md-4 mb-4" key={book.Key}>
                        <div className="kelompokKeahlian">
                          <div className="bg-white-kk">
                            <div className="">
                              <div className="card-body d-flex align-items-start position-relative">
                                <img
                                  src={`${API_LINK}Upload/GetFile/${book.Gambar}`}
                                  alt="gambar"
                                  className="cover-daftar-kk"
                                  height="200"
                                  onClick={() => onDetail("detail", book)}
                                />
                              </div>
                              <div className="content">
                                <div className="d-flex justify-content-between align-items-center mt-4">
                                  <h3
                                    className="font-bold text-blue-600"
                                    style={{ fontSize: "18px", width: "100%" }}
                                  >
                                    {decode(book.Judul)}
                                  </h3>
                                </div>
                              </div>
                              <div style={{ paddingLeft: "20px" }}>
                                <div
                                  className="mb-1"
                                  style={{
                                    fontSize: "12px",
                                  }}
                                >
                                  <div
                                    className="kk"
                                    style={{
                                      fontSize: "16px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      icon={faBook}
                                      style={{
                                        marginRight: "10px",
                                        color: "black",
                                        fontSize: "20px",
                                      }}
                                    />
                                    <span>
                                      {decode(book["Kelompok Keahlian"])}
                                    </span>
                                  </div>
                                </div>
                                <div className="mb-1 mt-2">
                                  <FontAwesomeIcon
                                    icon={faUser}
                                    style={{
                                      marginRight: "10px",
                                      color: "black",
                                      fontSize: "16px",
                                    }}
                                  />
                                  <span
                                    style={{
                                      fontSize: "16px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    {book.Uploader} •{" "}
                                    {new Date(book.Creadate).toLocaleDateString(
                                      "id-ID",
                                      {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                      }
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <p
                                    className="deskripsi d-flex"
                                    style={{
                                      fontSize: "14px",
                                      marginLeft: "0px",
                                      marginTop: "15px",
                                      marginRight: "20px",
                                    }}
                                  >
                                    {decode(book.Keterangan).substring(0, 150)}
                                    {book.Keterangan.length > 150 && "..."}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="card-footer mb-2 mr-2 ml-3 mt-2">
                              <div
                                className=""
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p className="mb-0 text-secondary mb-4">
                                  <i
                                    className="fas fa-circle"
                                    icon="circle"
                                    style={{
                                      color:
                                        book.Status === "Tidak Aktif"
                                          ? "red"
                                          : uploader === book.Uploader
                                          ? "#198754"
                                          : "#67ACE9",
                                      cursor: "pointer",
                                      marginRight: "20px",
                                      width: "10px",
                                    }}
                                  />
                                  {book.Status === "Tidak Aktif"
                                    ? "Tidak Aktif"
                                    : uploader === book.Uploader
                                    ? "Milik Saya"
                                    : "Pustaka Bersama"}
                                </p>

                                {uploader === book.Uploader && (
                                  <div className="card-footer p-1 d-flex align-items-center justify-content-end mb-4">
                                    <Icon
                                      name="edit"
                                      type="Bold"
                                      cssClass="btn px-2 py-0 text-primary"
                                      title="Ubah pustaka"
                                      onClick={() => onEdit("edit", book)}
                                    />
                                    <Icon
                                      name="trash"
                                      type="Bold"
                                      style={{ color: "red" }}
                                      title="Hapus pustaka"
                                      onClick={() => handleDeleteClick(book)}
                                    />
                                    <Icon
                                      name="list"
                                      type="Bold"
                                      cssClass="btn px-2 py-0 text-primary"
                                      title="Lihat detail Kelompok Keahlian"
                                      onClick={() => onDetail("detail", book)}
                                    />
                                    <div
                                      className="form-check form-switch py-0 ms-2"
                                      style={{ width: "fit-content" }}
                                    >
                                      <Input
                                        type="checkbox"
                                        title="Aktif / Nonaktif"
                                        className="form-check-input"
                                        checked={book.Status === "Aktif"}
                                        onChange={() =>
                                          handleStatusChange(
                                            book.Key,
                                            "Tidak Aktif"
                                          )
                                        }
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor="flexSwitchCheckDefault"
                                      ></label>
                                    </div>
                                  </div>
                                )}

                                {activeUser === book.PemilikKK && (
                                  <div
                                    className="card-footer p-1 d-flex align-items-center justify-content-end mb-4"
                                    style={{ marginLeft: "50px" }}
                                  >
                                    <Icon
                                      name="list"
                                      type="Bold"
                                      cssClass="btn px-2 py-0 text-primary mr-3"
                                      title="Lihat detail Kelompok Keahlian"
                                      onClick={() => onDetail("detail", book)}
                                    />
                                    <Icon
                                      name="delete"
                                      type="Bold"
                                      style={{ color: "red" }}
                                      title="Hapus pustaka"
                                      onClick={() => handleDeleteClick(book)}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                }
              })
            )}
          </div>
        </>
      ) : (
        <>
          <div
            className="card-keterangan"
            style={{
              background: "#67ACE9",
              borderRadius: "5px",
              padding: "10px 20px",
              marginBottom: "20px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            ↓ Pustaka Bersama
          </div>
          <div className="row mt-0 gx-4">
            {pustakas.filter(
              (book) =>
                book.Key !== null &&
                book.Status === "Aktif" &&
                book.PemilikKK !== activeUser &&
                uploader !== book.Uploader
            ).length === 0 ? (
              <div className="col-md-12">
                <Alert type="warning" message="Tidak ada data.." />
              </div>
            ) : (
              pustakas.map((book) => {
                if (
                  book.Key &&
                  book.Status === "Aktif" &&
                  book.PemilikKK !== activeUser &&
                  uploader !== book.Uploader
                ) {
                  return (
                    <>
                      <div className="col-md-4 mb-4" key={book.Key}>
                        <div className="kelompokKeahlian">
                          <div className="bg-white-kk">
                            <div className="">
                              <div className="card-body d-flex align-items-start position-relative">
                                <img
                                  src={`${API_LINK}Upload/GetFile/${book.Gambar}`}
                                  alt="gambar"
                                  className="cover-daftar-kk"
                                  height="200"
                                  onClick={() => onDetail("detail", book)}
                                />
                              </div>

                              <div className="content">
                                <div className="d-flex justify-content-between align-items-center mt-4">
                                  <h3
                                    className="font-bold text-blue-600"
                                    style={{ fontSize: "18px", width: "100%" }}
                                  >
                                    {decode(book.Judul)}
                                  </h3>
                                </div>
                              </div>
                              <div style={{ paddingLeft: "20px" }}>
                                <div
                                  className="mb-1"
                                  style={{
                                    fontSize: "12px",
                                  }}
                                >
                                  <div
                                    className="kk"
                                    style={{
                                      fontSize: "16px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      icon={faBook}
                                      style={{
                                        marginRight: "10px",
                                        color: "black",
                                        fontSize: "20px",
                                      }}
                                    />
                                    <span>
                                      {decode(book["Kelompok Keahlian"])}
                                    </span>
                                  </div>
                                </div>
                                <div className="mb-1 mt-2">
                                  <FontAwesomeIcon
                                    icon={faUser}
                                    style={{
                                      marginRight: "10px",
                                      color: "black",
                                      fontSize: "20px",
                                    }}
                                  />
                                  <span
                                    style={{
                                      fontSize: "16px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    {book.Uploader} •{" "}
                                    {new Date(book.Creadate).toLocaleDateString(
                                      "id-ID",
                                      {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                      }
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <p
                                    className="deskripsi d-flex"
                                    style={{
                                      fontSize: "14px",
                                      margin: "15px 20px 0 0",
                                    }}
                                  >
                                    {decode(book.Keterangan).length > 150
                                      ? decode(book.Keterangan).substring(
                                          0,
                                          150
                                        ) + "..."
                                      : decode(book.Keterangan)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="card-footer mb-2 mr-2 ml-3 mt-2">
                              <div
                                className=""
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <p
                                  className="mb-0 text-secondary"
                                  style={{ marginRight: "40px" }}
                                >
                                  <i
                                    className="fas fa-circle"
                                    icon="circle"
                                    style={{
                                      color:
                                        book.Status === "Tidak Aktif"
                                          ? "red"
                                          : uploader === book.Uploader
                                          ? "#198754"
                                          : "#67ACE9",
                                      cursor: "pointer",
                                      marginRight: "20px",
                                      width: "10px",
                                    }}
                                  />
                                  {book.Status === "Tidak Aktif"
                                    ? "Tidak Aktif"
                                    : uploader === book.Uploader
                                    ? "Milik Saya"
                                    : "Pustaka Bersama"}
                                </p>

                                {uploader !== book.Uploader && (
                                  <div
                                    className="card-footer p-1 d-flex align-items-center justify-content-end"
                                    style={{ marginLeft: "30px" }}
                                  >
                                    <button
                                      onClick={() => onDetail("detail", book)}
                                      style={{
                                        width: "100px",
                                        border: "none",
                                        padding: "10px 20px",
                                        color: "white",
                                        background: "#0E6EFE",
                                        borderRadius: "10px",
                                        fontWeight: "bold",
                                        marginBottom: "10px",
                                      }}
                                    >
                                      Buka
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                }
              })
            )}
          </div>
        </>
      )}
    </>
  );
}

export default CardPustaka;
