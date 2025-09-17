import { useState } from "react";
import Icon from "./Icon.jsx";
import AppContext_master from "../page/Materi/master-proses/MasterContext.jsx";
import AppContext_test from "../page/Materi/master-test/TestContext.jsx";
import { decode } from "he";

const MAX_DESCRIPTION_LENGTH = 100;

const CardKategoriProgram = ({ onChangePage, kategori }) => {
  const [expandDeskripsi, setExpandDeskripsi] = useState(false);
  const handleExpandDescription = () => {
    setExpandDeskripsi(!expandDeskripsi);
  };

  return (
    <>
      <style>{`
        .card-kategori-program-container {
          display: flex;
          flex-wrap: wrap;
         
          width: 100%;
        }
        .card-kategori-program {
          transition: transform 0.3s, box-shadow 0.3s;
          flex: 1 1 48%; /* Adjusted to 48% to allow some space between the cards */
          margin: 10px;
          box-sizing: border-box; /* Ensure padding and border are included in the element's total width and height */
        }
        .card-kategori-program:hover {
          transform: translateY(-5px);
         
        }
        .description-container {
          display: flex;
          width: 100%;
        }
        .description-text {
          width: 100%;
          font-size: 15px;
          text-align: justify;
        }
      `}</style>
      <div className="card-kategori-program-container" style={{ width: "33%" }}>
        <div className="card-kategori-program">
          <div className="card mb-2">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <h6 className="card-title">
                  {kategori["Nama Kategori Program"]
                    ? decode(kategori["Nama Kategori Program"])
                    : "Kategori Program tidak tersedia"}
                </h6>
                <div>
                  <Icon
                    name="file"
                    type="Bold"
                    cssClass="btn px-2 py-0"
                    title="Materi"
                  />
                  <span>{kategori.materialCount}</span>
                </div>
              </div>
              <div className="description-container mt-2">
                <div className="me-2 bg-primary ps-1"></div>
                <div className="description-text">
                  <p
                    className="lh-sm mb-0"
                    style={{
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      maxHeight: expandDeskripsi ? "none" : "75px",
                      overflow: "hidden",
                    }}
                  >
                    {kategori.Deskripsi.length > MAX_DESCRIPTION_LENGTH &&
                    !expandDeskripsi ? (
                      <>
                        {decode(
                          kategori.Deskripsi.slice(0, MAX_DESCRIPTION_LENGTH)
                        ) + " ..."}
                        <a
                          className="btn btn-link text-decoration-none p-0"
                          onClick={handleExpandDescription}
                          style={{ fontSize: "12px" }}
                        >
                          Baca Selengkapnya <Icon name={"caret-down"} />
                        </a>
                      </>
                    ) : (
                      <>
                        {kategori.Deskripsi
                          ? decode(kategori.Deskripsi)
                          : "Deskripsi tidak tersedia"}
                        {expandDeskripsi && (
                          <a
                            className="btn btn-link text-decoration-none p-0"
                            onClick={handleExpandDescription}
                            style={{ fontSize: "12px" }}
                          >
                            Tutup <Icon name={"caret-up"} />
                          </a>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="d-flex justify-content-end">
                <button
                  onClick={() =>
                    onChangePage(
                      "index",
                      (AppContext_test.KategoriIdByKK = kategori.Key),
                      (AppContext_master.KategoriIdByKK = kategori.Key),
                      (kategori = { kategori })
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardKategoriProgram;
