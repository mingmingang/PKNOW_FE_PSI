import { useState, useEffect } from "react";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "../../style/PDF_Viewer.css";
import Loading from "./Loading";
import { API_LINK } from "../util/Constants";

export default function PDF_Viewer({
  pdfFileName,
  height = "750px",
  width = "100%",
}) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    if (pdfFileName) {
      const fileUrl = `${API_LINK}Upload/GetFile/${pdfFileName}`;
      setPdfUrl(fileUrl);
    } else {
      setPdfUrl(null);
    }
  }, [pdfFileName]);

  if (!pdfUrl) {
    return (
      <div style={{ height: height }}>
        Silakan pilih file PDF untuk ditampilkan.
      </div>
    );
  }

  return (
    <Worker
      workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
    >
      <div
        style={{
          height: height,
          width: width,
          border: "1px solid rgba(0, 0, 0, 0.3)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <Viewer
          fileUrl={pdfUrl}
          plugins={[defaultLayoutPluginInstance]}
          renderLoader={(percentages) => (
            <div style={{ width: "240px" }}>
              <Loading message={`Loading... ${Math.round(percentages)}%`} />
            </div>
          )}
        />
      </div>
    </Worker>
  );
}
