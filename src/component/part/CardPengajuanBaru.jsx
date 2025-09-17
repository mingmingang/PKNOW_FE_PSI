import { useState } from "react";
import Icon from "./Icon";
import Button from "./Button copy";
import "../../style/KelompokKeahlian.css";
import { API_LINK } from "../util/Constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap, faUser } from "@fortawesome/free-solid-svg-icons";
import { decode } from "he";

function CardPengajuanBaru({ data, onChangePage, isShow }) {
  const [showAllText, setShowAllText] = useState(isShow);

  const handleToggleText = () => {
    setShowAllText(!showAllText);
  };

  let status;
  let aksi;

  if (data.Status === "Ditolak") {
    status = (
      <p>
        Status: <span className="text-danger fw-bold">{data.Status}</span>
      </p>
    );
    aksi = (
      <Button
        iconName="eye"
        classType="primary btn-sm"
        label="Riwayat"
        onClick={() => onChangePage("detailRiwayat", data)}
        title="Klik untuk melihat riwayat pengajuan"
      />
    );
  } else if (data.Status === "Dibatalkan") {
    status = (
      <p>
        Status: <span className="text-secondary fw-bold">{data.Status}</span>
      </p>
    );
    aksi = (
      <Button
        iconName="eye"
        classType="primary btn-sm"
        label="Riwayat"
        onClick={() => onChangePage("detailRiwayat", data)}
        title="Klik untuk melihat riwayat pengajuan"
      />
    );
  } else if (data.Status === "Menunggu Acc") {
    status = (
      <p>
        Status:{" "}
        <span className="text-warning fw-bold">Menunggu Persetujuan</span>
      </p>
    );
    aksi = (
      <Button
        iconName="list"
        classType="primary btn-sm py-2"
        label="Detail"
        onClick={() => onChangePage("detailPengajuan", data)}
        title="Klik untuk melihat detail pengajuan"
      />
    );
  } else if (data.Status === "None") {
    status = "";
    aksi = (
      <Button
        iconName="list"
        classType="primary btn-sm py-2"
        label="Detail"
        onClick={() => onChangePage("detailKK", data)}
        title="Klik untuk melihat detail Kelompok Keahlian"
      />
    );
  } else {
    status = (
      <p>
        Status: <span className="text-secondary fw-bold">Aktif</span>
      </p>
    );
    aksi = (
      <Button
        iconName="plus"
        classType="primary btn-sm py-2"
        label="Gabung"
        onClick={() => onChangePage("add", data)}
        title="Klik untuk bergabung"
      />
    );
  }

  return (
    <>
      <div className="bg-white-kk pengajuan">
        <img
          alt="gambar"
          className="newws"
          src={`${API_LINK}Upload/GetFile/${data.Gambar}`}
        />
        <div className="">
          <div className="content">
            <h5 className="fw-bold mt-3" style={{ color: "#0A5EA8" }}>
              {data["Nama Kelompok Keahlian"]
                ? decode(data["Nama Kelompok Keahlian"])
                : "Default Title"}
            </h5>
            <div className="">
              <div className="">{status}</div>
              <h6 className="card-subtitle mt-1 mb-3">
                <FontAwesomeIcon icon={faUser} className="icon-style mr-2" />
                PIC : {data.PIC}
              </h6>
              <h6 className="card-subtitle mt-1 mb-3">
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className="icon-style mr-2"
                />
                {data.Prodi}
              </h6>
              <p
                className=""
                style={{
                  display: showAllText ? "block" : "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textAlign: "justify",
                  margin: "0px",
                }}
              >
                {data.Deskripsi ? decode(data.Deskripsi) : "Default Desc"}
              </p>
              <div
                className="d-flex justify-content-between align-items-center"
                style={{ marginTop: "30px", marginBottom: "20px" }}
              >
                <a className="text-decoration-none" onClick={handleToggleText}>
                  <span className="fw-semibold" style={{ cursor: "pointer" }}>
                    {showAllText ? "Ringkas" : "Selengkapnya"}
                  </span>{" "}
                  <Icon
                    name={showAllText ? "arrow-up" : "arrow-right"}
                    type="Bold"
                    cssClass="btn px-0 pb-1 text-primary"
                    title="Baca Selengkapnya"
                  />
                </a>
                {aksi}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CardPengajuanBaru;
