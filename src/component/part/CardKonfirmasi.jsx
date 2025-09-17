import { useState } from "react";
import Icon from "./Icon";
import "../../style/CardKonfirmasi.css";
import Button from "./Button copy";
import { API_LINK } from "../util/Constants";
import { decode } from "he";

function CardKonfirmasi({ data, onChangePage, isShow }) {
  const [showAllText, setShowAllText] = useState(isShow);

  const handleToggleText = () => {
    setShowAllText(!showAllText);
  };

  return (
    <>
      <div className="col-lg-4 mb-3">
        <div
          className="card p-0 "
          style={{
            border: "",
            borderRadius: "10px",
            borderColor: data.MenungguCount > 0 ? "#ffcc00" : "#67ACE9",
          }}
        >
          <div className="card-body p-0">
            <img
              src={`${API_LINK}Upload/GetFile/${data["Gambar"]}`}
              alt=""
              className="card-image"
              style={{ objectFit: "cover", borderRadius: "10px" }}
            />
            <h5
              className="card-title px-3 pt-2 pb-3"
              style={{
                color: "#0A5EA8",
                fontWeight: "bold",
                marginBottom: "0",
              }}
            >
              {decode(data["Nama Kelompok Keahlian"])}
            </h5>
            <div className="card-body p-3" style={{ marginTop: "-20px" }}>
              <div>
                <Icon
                  name="users"
                  type="Bold"
                  cssClass="btn px-0 pb-1 text-primary"
                  title="Anggota Kelompok Keahlian"
                />{" "}
                <span>
                  <a
                    href=""
                    className="fw-semibold text-dark text-decoration-none"
                  >
                    {data.AnggotaAktifCount} Anggota Aktif
                  </a>
                </span>
              </div>
              <div>
                <Icon
                  name="clock"
                  type="Bold"
                  cssClass="btn px-0 pb-1 text-primary"
                  title="Anggota Kelompok Keahlian"
                />{" "}
                <span>
                  <a
                    href=""
                    className="fw-semibold text-dark text-decoration-none"
                  >
                    {data.MenungguCount} Menunggu Persetujuan
                  </a>
                </span>
              </div>
              <p
                className="lh-sm mt-2"
                style={{
                  display: showAllText ? "block" : "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textAlign: "justify",
                }}
              >
                {decode(data.Deskripsi)}
              </p>
              <div className="d-flex justify-content-between align-items-center">
                <a
                  className="text-decoration-none"
                  onClick={handleToggleText}
                  style={{ cursor: "pointer" }}
                >
                  <span className="fw-semibold">
                    {showAllText ? "Ringkas" : "Selengkapnya"}
                  </span>{" "}
                  <Icon
                    name={showAllText ? "arrow-up" : "arrow-right"}
                    type="Bold"
                    cssClass="btn px-0 pb-1 text-primary"
                    title="Baca Selengkapnya"
                  />
                </a>
                <Button
                  iconName="user"
                  classType="primary btn-sm py-2"
                  label="Lihat Semua"
                  onClick={() => onChangePage("detail", data)}
                  title="Lihat detail Persetujuan Anggota Keahlian"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CardKonfirmasi;
