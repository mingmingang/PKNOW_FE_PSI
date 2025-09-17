import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faUser,
  faArrowRight,
  faPeopleGroup,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import "../../style/KelompokKeahlian.css";

export default function KelompokKeahlian({
  image,
  title,
  program,
  pic,
  description,
  statusText,
  ketButton,
  colorCircle,
  iconClass,
  showDropdown = true,
  showStatusText = true,
  showProdi = true,
  showUserProdi = true,
  anggota,
  statusPersetujuan,
  onClick,
}) {
  useEffect(() => {
    const dropdown = document.querySelector(".dropdown");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    if (dropdown && dropdownMenu) {
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
    }
  }, []);

  return (
    <div className="kelompokKeahlian">
      <div className="bg-white-kk">
        <img
          alt={`${title} image`}
          className="cover-daftar-kk"
          height="200"
          src={image}
          width="300"
        />
        <div className="d-flex justify-content-between align-items-center mt-4">
          <h3 className="text-xl font-bold text-blue-600">{title}</h3>
          {showDropdown && (
            <div className="dropdown">
              <i
                className="fas fa-ellipsis-h me-4"
                id="dropdownMenuButton"
                aria-expanded="false"
                data-bs-toggle="dropdown"
              ></i>
              <ul
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton"
              >
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
          )}
        </div>

        <div className="pemilik">
          <div className="prodi">
            <FontAwesomeIcon
              icon={showProdi ? faGraduationCap : faPeopleGroup}
              style={{ fontSize: "1.5rem", marginRight: "-5px" }}
            />
            <p className="text-gray-700" style={{ fontFamily: "Poppins" }}>
              {showProdi ? program : anggota}
            </p>
          </div>
          <div className="userProdi">
            <FontAwesomeIcon
              icon={showUserProdi ? faUser : faClock}
              style={{ fontSize: "1.5rem", marginRight: "5px" }}
            />
            <p className="text-gray-700" style={{ fontFamily: "Poppins" }}>
              {showUserProdi ? `PIC: ${pic}` : statusPersetujuan}
            </p>
          </div>
        </div>
        <p className="deskripsi">{description}</p>
        <div className="status-open">
          <table>
            <tbody>
              <tr>
                <td>
                  {showStatusText ? (
                    <>
                      <i
                        className="fas fa-circle"
                        style={{
                          color: colorCircle,
                          width: "1px",
                          marginRight: "20px",
                        }}
                      />
                      <span style={{ fontSize: "14px" }}>{statusText}</span>
                    </>
                  ) : (
                    <a
                      href="#selengkapnya"
                      className="text-blue-600"
                      style={{ textDecoration: "none" }}
                    >
                      Selengkapnya <FontAwesomeIcon icon={faArrowRight} />
                    </a>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          {ketButton && (
            <button
              className="bg-blue-100 text-white px-6 rounded-full open"
              aria-label={`Action for ${title}`}
              onClick={onClick}
            >
              <i
                className={iconClass}
                style={{ color: "white", marginRight: "10px" }}
              ></i>
              {ketButton}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
