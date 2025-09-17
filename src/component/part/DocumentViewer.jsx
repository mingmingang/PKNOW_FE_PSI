import { useState, useEffect } from "react";
import mammoth from "mammoth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMinus,
  faPlus,
  faDownload,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";
import "../../style/WordViewer.css";
import axios from "axios";

const WordViewer = ({ fileUrl, fileData, width = "1140px" }) => {
  const [htmlContent, setHtmlContent] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const fetchAndConvert = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Gagal mengambil file Word.");
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtmlContent(result.value);
      } catch (error) {
        setHtmlContent("<p>Gagal memuat dokumen.</p>");
      }
    };

    fetchAndConvert();
  }, [fileUrl]);

  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => prevZoom + 0.1);
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => (prevZoom > 0.5 ? prevZoom - 0.1 : prevZoom));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const setupDownload = async (fileUrl, formattedFileName) => {
    try {
      const response = await axios.get(fileUrl, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = formattedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {}
  };

  return (
    <div className="word-viewer-container" style={{ width: width }}>
      <div className="toolbar justify-content-between">
        <div className="d-flex">
          <button onClick={handleZoomOut} className="toolbar-button">
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <button onClick={handleZoomIn} className="toolbar-button">
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <div className="d-flex">
          <button onClick={handleResetZoom} className="toolbar-button">
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
          <button
            onClick={() => {
              setupDownload(fileUrl, fileData.formattedFileName);
            }}
            className="toolbar-button"
          >
            <FontAwesomeIcon icon={faDownload} />
          </button>
        </div>
      </div>

      <div
        className="word-viewer"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: "top left",
          transition: "transform 0.2s ease-in-out",
        }}
      ></div>
    </div>
  );
};

export default WordViewer;
