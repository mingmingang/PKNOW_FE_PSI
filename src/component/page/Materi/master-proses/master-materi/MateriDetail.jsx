import { useState, useEffect } from "react";
import Button from "../../../part/Button";
import Alert from "../../../part/Alert";
import { Stepper } from "react-form-stepper";
import AppContext_test from "../MasterContext";
import Loading from "../../../part/Loading";

export default function MasterMateriDetail({ onChangePage }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [pdfHeight, setPdfHeight] = useState("500px");
  const Materi = AppContext_test.DetailMateri;

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  useEffect(() => {
    const calculatePdfHeight = () => {
      const videoElement = document.getElementById("video");
      if (videoElement) {
        const videoHeight = videoElement.clientHeight;
        setPdfHeight(`${videoHeight}px`);
      }
    };

    calculatePdfHeight();
    window.addEventListener("resize", calculatePdfHeight);

    return () => {
      window.removeEventListener("resize", calculatePdfHeight);
    };
  }, [Materi.File_video_url]);

  if (isLoading) return <Loading />;

  const hasPDF = Materi.File_pdf_url;
  const hasVideo = Materi.File_video_url && isValidUrl(Materi.File_video_url);

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}

      <form>
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
            activeStep={0}
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
            <h3 className="card-title">{Materi.Judul}</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-lg-3 d-flex align-items-center justify-content-center">
                <img
                  src={Materi.Gambar}
                  alt="gambar"
                  className="img-fluid"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxWidth: "300px",
                    maxHeight: "300px",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className="col-lg-9 mt-3 mt-lg-0">
                <h4>Deskripsi</h4>
                <p style={{ textAlign: "justify" }}>{Materi.Keterangan}</p>
                <h5>Kata Kunci</h5>
                <p>
                  {Array.isArray(Materi["Kata Kunci"])
                    ? Materi["Kata Kunci"].join(", ")
                    : Materi["Kata Kunci"]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {hasPDF ? (
          <div className="card mt-4" style={{ borderColor: "#67ACE9" }}>
            <div
              className="card-header fw-medium text-white"
              style={{ backgroundColor: "#67ACE9" }}
            >
              <h5 className="card-title">File Materi (PDF)</h5>
            </div>
            <div className="card-body">
              <object
                data={Materi.File_pdf_url}
                type="application/pdf"
                width="100%"
                height={pdfHeight}
              >
                <p>
                  Maaf, browser Anda tidak mendukung preview file. Silakan{" "}
                  <a href={Materi.File_pdf_url}>unduh file</a> untuk melihatnya.
                </p>
              </object>
            </div>
          </div>
        ) : null}

        {hasVideo ? (
          <div className="card mt-4" style={{ borderColor: "#67ACE9" }}>
            <div
              className="card-header fw-medium text-white"
              style={{ backgroundColor: "#67ACE9" }}
            >
              <h5 className="card-title">Video Materi</h5>
            </div>
            <div className="card-body">
              <video id="video" controls width="100%" height="auto">
                <source src={Materi.File_video_url} type="video/mp4" />
                Browser Anda tidak mendukung tag video.
              </video>
            </div>
          </div>
        ) : null}

        {!hasPDF && !hasVideo ? (
          <div className="alert alert-warning mt-4" role="alert">
            Tidak ada materi yang tersedia.
          </div>
        ) : null}

        <div className="float my-4 mx-1">
          <Button
            classType="outline-secondary me-2 px-4 py-2"
            label="Kembali"
            onClick={() => onChangePage("index")}
          />
          <Button
            classType="dark ms-3 px-4 py-2"
            label="Berikutnya"
            onClick={() => onChangePage("pretestDetail")}
          />
        </div>
      </form>
    </>
  );
}
