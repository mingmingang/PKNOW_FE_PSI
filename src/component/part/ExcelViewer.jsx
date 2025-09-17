import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMinus,
  faPlus,
  faDownload,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";
import "../../style/ExcelViewer.css";
import axios from "axios";

const ExcelViewer = ({ fileUrl, fileData, width = "1140px" }) => {
  const [data, setData] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const fetchAndParse = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Gagal mengambil file Excel.");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setData(jsonData);
      } catch (error) {
        setData([["Gagal memuat dokumen Excel."]]);
      }
    };

    fetchAndParse();
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
    <div className="excel-viewer-container" style={{ width: width }}>
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
        className="excel-viewer"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: "top left",
          transition: "transform 0.2s ease-in-out",
        }}
      >
        <table className="excel-table">
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`cell ${rowIndex === 0 ? "header-cell" : ""}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelViewer;
