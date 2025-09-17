import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap, faUser } from "@fortawesome/free-solid-svg-icons";
import "../../style/DaftarPustaka.css";

export default function DataDaftarPustaka({
  image,
  title,
  program,
  pic,
  description,
  statusText,
  ketButton,
  colorCircle,
  onClick,
}) {
  useEffect(() => {
    const dropdown = document.querySelector(".dropdown");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    const handleDropdownClick = (event) => {
      event.stopPropagation();
      dropdownMenu.classList.toggle("show");
    };

    const handleClickOutside = (event) => {
      if (!dropdown.contains(event.target)) {
        dropdownMenu.classList.remove("show");
      }
    };

    dropdown.addEventListener("click", handleDropdownClick);
    document.addEventListener("click", handleClickOutside);

    return () => {
      dropdown.removeEventListener("click", handleDropdownClick);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="daftarPustaka">
      <div className="bg-white-dp">
        <img
          alt={`${title} image`}
          className="cover-daftar-dp"
          height="200"
          src={image}
          width="300"
        />
        <div className="d-flex justify-content-between align-items-center mt-4">
          <h3 className="text-xl font-bold text-blue-600">{title}</h3>
          <div className="dropdown">
            <i
              className="fas fa-ellipsis-h me-4"
              id="dropdownMenuButton"
              aria-expanded="false"
            ></i>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li>
                <a className="dropdown-item" href="#edit">
                  <i
                    className="fas fa-edit"
                    style={{ marginRight: "8px", color: "#0A5EA8" }}
                  ></i>
                  <span style={{ color: "#0A5EA8" }}>Edit</span>
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#delete">
                  <i
                    className="fas fa-trash-alt"
                    style={{ marginRight: "8px", color: "red" }}
                  ></i>
                  <span style={{ color: "red" }}>Delete</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pemilik">
          <div className="prodi">
            <FontAwesomeIcon
              icon={faGraduationCap}
              style={{ fontSize: "1.5rem", marginRight: "-5px" }}
            />
            <p className="text-gray-700" style={{ fontFamily: "Poppins" }}>
              {program}
            </p>
          </div>
          <div className="userProdi">
            <FontAwesomeIcon
              icon={faUser}
              style={{ fontSize: "1.5rem", marginRight: "5px" }}
            />
            <p className="text-gray-700" style={{ fontFamily: "Poppins" }}>
              PIC: {pic}
            </p>
          </div>
        </div>
        <p className="deskripsi">{description}</p>
        <div className="status-open">
          <table>
            <tbody>
              <tr>
                <td>
                  <i
                    className="fas fa-circle"
                    style={{
                      color: colorCircle,
                      width: "2px",
                      marginRight: "10px",
                    }}
                  />
                </td>
                <td>
                  <p>{statusText}</p>
                </td>
              </tr>
            </tbody>
          </table>
          {ketButton && (
            <button
              className="bg-blue-100 text-white px-6 rounded-full"
              aria-label={`Action for ${title}`}
              onClick={onClick}
            >
              <i className="fas fa-book" style={{ marginRight: "8px" }}></i>
              {ketButton}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
