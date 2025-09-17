import { useState } from "react";
import Icon from "./Icon";
import Input from "./Input";
import AppContext_master from "../page/Materi/master-proses/MasterContext.jsx";
import AppContext_test from "../page/Materi/master-test/TestContext.jsx";
import { decode } from "he";
import "../../style/CardKategoriProgram.css";

const MAX_DESCRIPTION_LENGTH = 100;

const CardKategoriProgram = ({
  data,
  onChangePage,
  onChangeStatus,
  onDelete,
  index,
}) => {
  const handleStatusChange = (data, status) => {
    onChangeStatus(data, status);
  };

  const [expandDeskripsi, setExpandDeskripsi] = useState(false);

  const handleExpandDescription = () => {
    setExpandDeskripsi(!expandDeskripsi);
  };

  const handleDeleteClick = (data) => {
    onDelete(data.Key);
  };

  return (
    <div className="col">
      <div className="card card-kategori-program mt-3">
        {data.Status === "Draft" ? (
          <span className="draft-badge-katpro text-danger bg-white px-2 ms-2 mb-0">
            Draft
          </span>
        ) : (
          ""
        )}
        <div className="card-body">
          <div className="card-header-row d-flex justify-content-between">
            <h6 className="card-title">
              {index}
              {". "}
              {data["Nama Kategori"]
                ? decode(data["Nama Kategori"])
                : "Kategori tidak tersedia"}
            </h6>
            <div className="materi-count">
              <Icon
                name="file"
                cssClass="text-primary me-1"
                title="Materi sudah publikasi"
              />
              <span className="text-primary">{data.MateriCount}</span>
            </div>
          </div>
          <div className="description-container d-flex mt-2">
            <div className="me-2 bg-primary ps-1"></div>
            <div className="description-text">
              <p
                className="mb-0"
                style={{
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  maxHeight: expandDeskripsi ? "none" : "75px",
                  overflow: "hidden",
                  textAlign: "justify",
                }}
              >
                {data.Deskripsi &&
                data.Deskripsi.length > MAX_DESCRIPTION_LENGTH &&
                !expandDeskripsi ? (
                  <>
                    {decode(data.Deskripsi.slice(0, MAX_DESCRIPTION_LENGTH)) +
                      " ..."}
                    <a
                      className="btn btn-link text-decoration-none p-0"
                      onClick={handleExpandDescription}
                      style={{ fontSize: "12px", textAlign: "justify" }}
                    >
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
                        className="btn btn-link text-decoration-none p-0"
                        onClick={handleExpandDescription}
                        style={{ fontSize: "12px", textAlign: "justify" }}
                      >
                        Tutup <Icon name={"caret-up"} />
                      </a>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>
          {data.Status === "Draft" ? (
            <div className="draft-icon d-flex justify-content-end mt-3">
              <Icon
                name="edit"
                type="Bold"
                cssClass="btn px-2 py-0 text-primary"
                title="Ubah data"
                onClick={() => onChangePage("editKategori", data)}
              />
              <Icon
                name="trash"
                type="Bold"
                cssClass="btn px-2 py-0 text-primary"
                title="Hapus data permanen"
                onClick={() => handleDeleteClick(data)}
              />
              <Icon
                name="paper-plane"
                type="Bold"
                cssClass="btn px-1 py-0 text-primary"
                title="Publikasi Kategori Program"
                onClick={() => handleStatusChange(data, "Aktif")}
              />
            </div>
          ) : (
            <div className="d-flex justify-content-end">
              <div className="lihat-materi d-flex justify-content-end">
                <button
                  onClick={() =>
                    onChangePage(
                      "materi",
                      (AppContext_test.KategoriIdByKK = data.Key),
                      (AppContext_master.KategoriIdByKK = data.Key),
                      (data = { data })
                    )
                  }
                  style={{
                    border: "none",
                    background: "#0E6EFE",
                    padding: "5px 10px",
                    color: "white",
                    marginTop: "10px",
                    borderRadius: "10px",
                  }}
                >
                  Lihat Materi
                </button>
              </div>
              <div className="mt-3">
                <Icon
                  name="edit"
                  type="Bold"
                  cssClass="btn px-2 py-0 text-primary"
                  title="Ubah data"
                  onClick={() => onChangePage("editKategori", data)}
                />
              </div>
              <div
                class="form-check form-switch py-0 ms-2 mt-3"
                style={{ width: "fit-content" }}
              >
                <Input
                  type="checkbox"
                  forInput=""
                  label=""
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
      </div>
    </div>
  );
};

export default CardKategoriProgram;
