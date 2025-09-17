import Button from "./Button copy";
import "../../style/KelompokKeahlian.css";
import { decode } from "he";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { API_LINK } from "../util/Constants";
import { useState } from "react";
import Swal from "sweetalert2";
import UseFetch from "../util/UseFetch";

function CardKelasTraining({
  config = { footer: "", icon: "", className: "", label: "", page: "" },
  data = {
    id: "",
    title: "",
    desc: "",
    status: "",
    gambar: "",
    ProgramStudi: "",
    publikasi: "",
  },
  onChangePage,
  title,
  harga = 0,
  detailProgram,
}) {
  let cardContent;
  if (detailProgram == "ya") {
    cardContent = (
      <div className="d-flex justify-content-end">
        <div style={{ marginLeft: "175px" }}>
          <Button
            iconName="info"
            classType={`${config.className} py-2 mt-3`}
            label="Detail Program"
            onClick={() => onChangePage("detailprogram", data)}
            style={{ border: "none", width: "200px", marginLeft: "-40px" }}
          />
        </div>
      </div>
    );
  } else {
    if (data.publikasi !== "Terpublikasi") {
      cardContent = (
        <div className="d-flex justify-content-between">
          <div>
            <Button
              iconName="info"
              classType={`${config.className} py-2 mt-3`}
              label="Detail Kelas"
              onClick={() => onChangePage("detail", data)}
              style={{ border: "none" }}
            />
          </div>
          <div className="ml-4">
            <Button
              iconName="upload"
              classType={`${config.className} py-2 mt-3`}
              label="Publikasi Kelas"
              onClick={() => onChangePage("publikasi", data)}
              style={{ border: "none" }}
            />
          </div>
        </div>
      );
    } else {
      cardContent = (
        <div className="d-flex justify-content-between">
          <div>
            <Button
              iconName="info"
              classType={`${config.className} py-2 mt-3`}
              label="Detail Kelas"
              onClick={() => onChangePage("detail", data)}
              style={{ border: "none" }}
            />
          </div>
          <div className="ml-4">
            <Button
              iconName="ban"
              classType={`${config.className} py-2 mt-3`}
              label="Batal Publikasi"
              onClick={() => {
                Swal.fire({
                  title: "Apakah Anda yakin?",
                  text: "Anda akan membatalkan publikasi kelas ini!",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#d33",
                  cancelButtonColor: "#3085d6",
                  confirmButtonText: "Ya, batalkan!",
                  cancelButtonText: "Tidak",
                }).then((result) => {
                  if (result.isConfirmed) {
                    UseFetch(API_LINK + "Program/BatalkanPublikasi", {
                      idProgram: data.id,
                    })
                      .then((responseData) => {
                        Swal.fire(
                          "Dibatalkan!",
                          "Publikasi kelas telah dibatalkan.",
                          "success"
                        );
                        window.location.reload();
                      })
                      .catch((error) => {})
                      .finally(() => setIsLoading(false));
                  }
                });
              }}
              style={{
                border: "none",
                backgroundColor: "red",
                color: "white",
              }}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="kelompokKeahlian">
      <div className="bg-white-kk">
        <img
          alt={`${title} image`}
          className="cover-daftar-kk"
          height="200"
          src={`${API_LINK}Upload/GetFile/${data.gambar}`}
          width="300"
        />

        <div className="row">
          <div className="d-flex justify-content-between align-items-center mt-2 ml-3">
            <h3
              className="text-xl font-bold text-blue-600 "
              style={{ fontSize: "17px" }}
            >
              {decode(data.title)}
            </h3>
          </div>
        </div>

        <div className="pemilik ">
          <div className="prodi" style={{ fontSize: "14px", color: "#4D4D4D" }}>
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="icon-style"
              style={{ fontSize: "20px" }}
            />
            <p
              className="700"
              style={{
                marginLeft: "15px",
                width: "100%",
                fontSize: "14px",
                color: "#4D4D4D",
              }}
            >
              {data.ProgramStudi}
            </p>
          </div>
        </div>

        {data.cek === "dapat akses" ? (
          <div className="pemilik">
            <div
              className="prodi"
              style={{ fontSize: "14px", color: "#4D4D4D" }}
            >
              <i
                className="fas fa-user"
                style={{ fontSize: "20px", paddingLeft: "5px" }}
              ></i>
              <p
                className="700 ml-3"
                style={{
                  marginLeft: "15px",
                  width: "100%",
                  fontSize: "14px",
                  color: "#4D4D4D",
                }}
              >
                {data.PIC}
              </p>
            </div>
          </div>
        ) : (
          <div className="pemilik">
            <div
              className="prodi"
              style={{ fontSize: "14px", color: "#4D4D4D" }}
            >
              <i
                className="fas fa-tag"
                style={{ fontSize: "20px", paddingLeft: "5px" }}
              ></i>
              <p
                className="700 ml-3"
                style={{
                  marginLeft: "15px",
                  width: "100%",
                  fontSize: "14px",
                  color: "#4D4D4D",
                }}
              >
                {data.publikasi && data.publikasi === "Terpublikasi" ? (
                  data.harga && data.harga > 0 ? (
                    <div
                      style={{
                        color: "red",
                        fontWeight: "bold",
                      }}
                    >
                      Rp.{" "}
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })
                        .format(data.harga)
                        .replace("Rp", "")
                        .trim()}
                    </div>
                  ) : (
                    <div
                      style={{
                        color: "green",
                        fontWeight: "bold",
                      }}
                    >
                      Gratis
                    </div>
                  )
                ) : (
                  <div
                    style={{
                      color: "orange",
                      fontWeight: "bold",
                    }}
                  >
                    Belum Dipublikasi
                  </div>
                )}
              </p>
            </div>
          </div>
        )}

        <div
          className="deskripsi-container "
          style={{ alignItems: "center", width: "100%" }}
        >
          <p className="deskripsi descni" style={{ marginBottom: "10px" }}>
            {decode(data.desc).substring(0, 100)}
            {data.desc.length > 100 && "..."}
          </p>
        </div>

        <div className="card-footer status-open mb-2">
          <div className="card-content" style={{ alignItems: "center" }}>
            {cardContent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardKelasTraining;
