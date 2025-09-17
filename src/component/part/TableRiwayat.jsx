import { useState } from "react";
import "../../style/Table.css";
import Konfirmasi from "../part/Konfirmasi";
import { FaTrash } from "react-icons/fa";

const Table = ({ tableHead, tableData }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(tableData.length / rowsPerPage);

  const currentData = tableData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleDeleteClick = (rowIndex) => {
    setSelectedRow(rowIndex);
    setShowConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedRow !== null) {
      const newData = [...tableData];
      newData.splice(selectedRow, 1);
      setSelectedRow(null);
      setShowConfirmation(false);
    }
  };

  const handleDeleteCancel = () => {
    setSelectedRow(null);
    setShowConfirmation(false);
  };

  return (
    <div className="table-container">
      <table className="dynamic-table">
        <thead>
          <tr>
            {tableHead.map((head, index) => (
              <th key={index}>{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>{(currentPage - 1) * rowsPerPage + rowIndex + 1}</td>
              {row.map((cell, cellIndex) => {
                if (tableHead[cellIndex + 1] === "Lampiran") {
                  return (
                    <td key={cellIndex}>
                      <a
                        href={cell.url}
                        download={cell.name}
                        style={{
                          textDecoration: "none",
                          color: "white",
                          fontWeight: "500",
                          backgroundColor: "#0A5EA8",
                          padding: "5px 10px",
                          borderRadius: "10px",
                        }}
                      >
                        {cell.name}
                      </a>
                    </td>
                  );
                } else if (tableHead[cellIndex + 1] === "Aksi") {
                  return (
                    <td key={cellIndex}>
                      <FaTrash
                        className="trash-icon"
                        onClick={() =>
                          handleDeleteClick(
                            (currentPage - 1) * rowsPerPage + rowIndex
                          )
                        }
                      />
                    </td>
                  );
                } else {
                  return <td key={cellIndex}>{cell}</td>;
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={currentPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      {showConfirmation && (
        <Konfirmasi
          title="Konfirmasi Penghapusan"
          pesan="Apakah Anda yakin ingin menghapus riwayat pengajuan ini?"
          onYes={handleDeleteConfirm}
          onNo={handleDeleteCancel}
        />
      )}
    </div>
  );
};

export default Table;
