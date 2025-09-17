import { useState } from "react";
import Button from "./Button copy";
import Icon from "./Icon";
import Input from "./Input";
import { API_LINK } from "../util/Constants";
import { decode } from "html-entities";
import "../../style/CardProgram.css";

const MAX_DESCRIPTION_LENGTH = 200;

const CardProgram = ({
  id,
  data,
  isActive,
  onClick,
  children,
  onChangePage,
  onChangeStatus,
  onDelete,
  index,
}) => {
  const handleStatusChange = (data, status) => {
    onChangeStatus(data, status);
  };

  const handleDeleteClick = (data) => {
    onDelete(data.Key);
  };

  const [expandDeskripsi, setExpandDeskripsi] = useState(false);
  const handleExpandDescription = () => {
    setExpandDeskripsi(!expandDeskripsi);
  };

  return (
    <div id={id} className={`card mt-3 ${isActive ? "border-primary" : ""}`}>
      {data.Status === "Draft" ? (
        <span className="draft-badge">Draft</span>
      ) : (
        ""
      )}
      <div className={`card-body-content ${isActive ? "active" : ""}`}>
        <img
          alt={`image`}
          className="cover-daftar-kk"
          height="200"
          src={`${API_LINK}Upload/GetFile/${data.Gambar}`}
        />
        <div className="program-info">
          <p className="program-index">
            {index}
            {". "}
            {data && data["Nama Program"]
              ? decode(data["Nama Program"])
              : "Nama Program tidak tersedia"}
          </p>
          <p className={`program-description ${!isActive ? "clamped" : ""}`}>
            {data.Deskripsi.length > MAX_DESCRIPTION_LENGTH &&
            !expandDeskripsi ? (
              <>
                {decode(data.Deskripsi.slice(0, MAX_DESCRIPTION_LENGTH)) +
                  " ..."}
                <a className="read-more-link" onClick={handleExpandDescription}>
                  Baca Selengkapnya <Icon name={"caret-down"} />
                </a>
              </>
            ) : (
              <>
                {data.Deskripsi
                  ? decode(data.Deskripsi)
                  : "Deskripsi tidak tersedia"}
                {expandDeskripsi && (
                  <a
                    className="read-more-link"
                    onClick={handleExpandDescription}
                  >
                    Tutup <Icon name={"caret-up"} />
                  </a>
                )}
              </>
            )}
          </p>
        </div>
        <div className="action-buttons">
          <div className="d-flex">
            <div className="mt-3">
              {data.Status === "Draft" ? (
                <div className="draft-actions">
                  <Icon
                    name="edit"
                    type="Bold"
                    cssClass="btn px-2  py-0 text-primary"
                    title="Ubah data"
                    onClick={() => onChangePage("edit", data)}
                    style={{
                      borderRight: "1px solid grey",
                      borderRadius: "0px",
                    }}
                  />
                  <Icon
                    name="trash"
                    type="Bold"
                    cssClass="btn px-2 py-0"
                    title="Hapus data permanen"
                    onClick={() => handleDeleteClick(data)}
                    style={{
                      borderRight: "1px solid grey",
                      borderRadius: "0px",
                      color: "red",
                    }}
                  />
                  <Icon
                    name="paper-plane"
                    type="Bold"
                    cssClass="btn px-1 py-0 text-primary"
                    title="Publikasi program"
                    onClick={() => handleStatusChange(data, "Aktif")}
                  />
                </div>
              ) : (
                <div className="published-actions ">
                  <Icon
                    name="edit"
                    type="Bold"
                    cssClass="btn px-2 py-0 text-primary"
                    title="Ubah data"
                    onClick={() => onChangePage("edit", data)}
                  />
                  <div
                    className="form-check form-switch py-0 ms-2"
                    style={{ width: "fit-content" }}
                  >
                    <Input
                      type="checkbox"
                      className="form-check-input"
                      checked={data.Status === "Aktif"}
                      onChange={() =>
                        handleStatusChange(
                          data,
                          data.Status === "Aktif" ? "Tidak Aktif" : "Aktif"
                        )
                      }
                    />
                    <label
                      className="form-check-label"
                      for="flexSwitchCheckDefault"
                    ></label>
                  </div>
                </div>
              )}
            </div>
            <div className="">
              <Button
                iconName={isActive ? "caret-up" : "caret-down"}
                classType="btn-sm px-2 rounded-3 mt-1"
                onClick={onClick}
                title="Detail Kelompok Keahlian"
                style={{
                  background: "white",
                  color: "#0A5EA8",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
                  fontSize: "25px",
                  padding: "5px 10px",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className="card-body "
        style={{ display: isActive ? "block" : "none" }}
      >
        <div className="kategori-header">
          <h5 className="text-primary fw-semibold mb-0 mt-2">
            Daftar Kategori Program
          </h5>

          <Button
            iconName="add"
            classType="primary btn-sm mb-2 py-2 rounded-3"
            label="Tambah Kategori"
            onClick={() => onChangePage("addKategori", data)}
          />
        </div>
        {children}
      </div>
    </div>
  );
};

export default CardProgram;
