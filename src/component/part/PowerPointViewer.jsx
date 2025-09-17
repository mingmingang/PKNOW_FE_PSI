import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMinus,
  faPlus,
  faDownload,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";
import "../../style/PowerPointViewer.css";
import UseFetch from "../util/UseFetch";

const PowerPointViewerIframe = ({ fileUrl, fileData }) => {
  const [zoomLevel, setZoomLevel] = useState(1);

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
      const response = await UseFetch(fileUrl, {}, "GET");
      
      if (response === "ERROR") {
        throw new Error("Gagal mengunduh file");
      }

      const blob = new Blob([response], {
        type: "application/vnd.ms-powerpoint",
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = formattedFileName || "presentation.pptx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    fileUrl
  )}`;

  return (
    <div className="powerpoint-viewer-container">
      <div className="toolbar justify-content-between">
        <div className="d-flex">
          <button
            onClick={handleZoomOut}
            className="toolbar-button"
            aria-label="Perkecil Zoom"
          >
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <button
            onClick={handleZoomIn}
            className="toolbar-button"
            aria-label="Perbesar Zoom"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <div className="d-flex">
          <button
            onClick={handleResetZoom}
            className="toolbar-button"
            aria-label="Reset Zoom"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
          <button
            onClick={() => {
              setupDownload(
                fileUrl,
                fileData?.formattedFileName || "presentation.pptx"
              );
            }}
            className="toolbar-button"
            aria-label="Unduh Presentasi"
          >
            <FontAwesomeIcon icon={faDownload} />
          </button>
        </div>
      </div>

      <div
        className="powerpoint-viewer"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: "top left",
          transition: "transform 0.2s ease-in-out",
        }}
      >
        <iframe
          src={officeViewerUrl}
          width="100%"
          height="600px"
          frameBorder="0"
          title="PowerPoint Viewer"
        ></iframe>
      </div>
    </div>
  );
};

export default PowerPointViewerIframe;